#!/usr/bin/env python3
"""
NotebookLM Query Tool
Wrapper for notebooklm CLI with fuzzy search and context-aware queries
"""

import os
import sys
import json
import argparse
import subprocess
from pathlib import Path

# Auto-detect and use venv if available
skill_dir = Path(__file__).parent.parent
venv_python = skill_dir / ".venv" / "bin" / "python3"
if venv_python.exists() and sys.executable != str(venv_python):
    os.execl(str(venv_python), str(venv_python), *sys.argv)

# Add venv packages for imports
venv_site = skill_dir / ".venv" / "lib" / "python3.14" / "site-packages"
if venv_site.exists():
    sys.path.insert(0, str(venv_site))

try:
    from thefuzz import fuzz, process
    HAS_FUZZ = True
except ImportError:
    HAS_FUZZ = False

class NotebookLMClient:
    """Client that wraps the notebooklm CLI"""
    
    def __init__(self):
        # Find notebooklm in venv or PATH
        skill_dir = Path(__file__).parent.parent
        venv_notebooklm = skill_dir / ".venv" / "bin" / "notebooklm"
        if venv_notebooklm.exists():
            self.notebooklm_cmd = str(venv_notebooklm)
        else:
            self.notebooklm_cmd = "notebooklm"
        
    def _run(self, args, capture=True):
        """Run notebooklm CLI command"""
        cmd = [self.notebooklm_cmd] + args
        if capture:
            result = subprocess.run(cmd, capture_output=True, text=True)
            return result.stdout, result.stderr, result.returncode
        else:
            subprocess.run(cmd)
            return None, None, 0
    
    def list_notebooks(self):
        """List all notebooks with fuzzy-searchable output"""
        stdout, stderr, code = self._run(["list", "--json"])
        if code != 0:
            print(f"Error: {stderr}")
            return []
        
        try:
            data = json.loads(stdout)
            return data.get("notebooks", [])
        except json.JSONDecodeError:
            # Fallback: parse text output
            return self._parse_text_list(stdout)
    
    def _parse_text_list(self, text):
        """Parse text output from list command"""
        notebooks = []
        for line in text.split("\n"):
            # Look for lines with notebook IDs
            if "│" in line and "Owner" not in line and "─" not in line:
                parts = line.split("│")
                if len(parts) >= 3:
                    notebook_id = parts[1].strip().replace("…", "")
                    title = parts[2].strip()
                    if notebook_id and title and "ID" not in title:
                        notebooks.append({"id": notebook_id, "title": title})
        return notebooks
    
    def fuzzy_find_notebook(self, query):
        """
        Fuzzy match notebook by title or ID prefix.
        Uses notebooklm CLI's built-in fuzzy matching.
        """
        # Try to use the notebook directly - CLI has fuzzy matching built-in
        stdout, stderr, code = self._run(["use", query])
        
        if code == 0:
            # Success! Extract notebook info from output
            for line in stdout.split("\n"):
                if "Matched:" in line:
                    # Parse matched notebook
                    return {"matched": True, "query": query, "output": stdout}
                if "│" in line and "ID" not in line and "Owner" not in line:
                    parts = line.split("│")
                    if len(parts) >= 3:
                        return {
                            "id": parts[1].strip(),
                            "title": parts[2].strip(),
                            "matched": True
                        }
        
        # If CLI fuzzy matching failed, try manual list + match
        notebooks = self.list_notebooks()
        
        if HAS_FUZZ and notebooks:
            titles = [n["title"] for n in notebooks]
            match = process.extractOne(query, titles, scorer=fuzz.partial_ratio)
            if match and match[1] > 60:
                title = match[0]
                notebook = next(n for n in notebooks if n["title"] == title)
                return {**notebook, "confidence": match[1], "matched": True}
        
        # Substring fallback
        query_lower = query.lower()
        for n in notebooks:
            if query_lower in n["title"].lower():
                return {**n, "matched": True}
            if n["id"].startswith(query):
                return {**n, "matched": True}
        
        return {"matched": False, "query": query, "notebooks": notebooks}
    
    def query_notebook(self, notebook_id_or_title, query, context_type="general"):
        """
        Query a specific notebook with context-aware expansion.
        
        First switches to the notebook, then runs the query.
        """
        # First find the notebook with fuzzy matching
        find_result = self.fuzzy_find_notebook(notebook_id_or_title)
        if not find_result.get("matched"):
            return {
                "query": query,
                "error": f"Notebook not found: {notebook_id_or_title}",
                "success": False
            }
        
        # Use the resolved title or ID
        resolved_title = find_result.get("title", notebook_id_or_title)
        
        # Switch to the resolved notebook using ID (more reliable)
        resolved_id = find_result.get("id", notebook_id_or_title)
        use_stdout, use_stderr, use_code = self._run(["use", resolved_id])
        if use_code != 0:
            # Try using title if ID failed
            use_stdout, use_stderr, use_code = self._run(["use", resolved_title])
            if use_code != 0:
                return {
                    "query": query,
                    "error": f"Failed to switch to notebook: {use_stderr}",
                    "success": False
                }
        
        # Context-aware query expansion
        expansions = {
            "skill_building": "agent architecture patterns, minimal design, UX flow, trigger mechanisms, persona design",
            "essay_writing": "argument structure, evidence, transitions, thesis statement, conclusion",
            "research": "key concepts, expert views, citations, methodology, findings"
        }
        
        enhanced_query = query
        if context_type in expansions:
            enhanced_query = f"{query}. Also relevant: {expansions[context_type]}"
        
        # Run the query
        stdout, stderr, code = self._run(["ask", enhanced_query])
        
        return {
            "query": query,
            "enhanced": enhanced_query,
            "context": context_type,
            "response": stdout if code == 0 else stderr,
            "success": code == 0
        }
    
    def add_source(self, source_path):
        """Add a source to the current notebook"""
        if source_path.startswith("http"):
            stdout, stderr, code = self._run(["source", "add", source_path])
        elif source_path.startswith("1") and len(source_path) > 20:
            # Likely Google Drive file ID
            stdout, stderr, code = self._run(["source", "add-drive", source_path])
        else:
            # Local file
            stdout, stderr, code = self._run(["source", "add", source_path])
        
        return {
            "source": source_path,
            "output": stdout if code == 0 else stderr,
            "success": code == 0
        }
    
    def create_notebook(self, title):
        """Create a new notebook"""
        stdout, stderr, code = self._run(["create", title])
        return {
            "title": title,
            "output": stdout if code == 0 else stderr,
            "success": code == 0
        }

def main():
    parser = argparse.ArgumentParser(
        description="Query NotebookLM notebooks with fuzzy search",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Fuzzy find notebook
  %(prog)s search --query "AI writing"
  
  # Query with context expansion
  %(prog)s query --notebook "AI writing" --query "minimal agents" --context skill_building
  
  # Add source
  %(prog)s add-source --path "https://example.com/article"
  
  # Create notebook
  %(prog)s create --title "My Research"
        """
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Command")
    
    # List command
    list_parser = subparsers.add_parser("list", help="List all notebooks")
    list_parser.add_argument("--json", action="store_true", help="Output JSON")
    
    # Search command (fuzzy)
    search_parser = subparsers.add_parser("search", help="Fuzzy search notebooks")
    search_parser.add_argument("--query", "-q", required=True, help="Fuzzy search query")
    search_parser.add_argument("--json", action="store_true", help="Output JSON")
    
    # Query command
    query_parser = subparsers.add_parser("query", help="Query notebook with context")
    query_parser.add_argument("--notebook", "-n", required=True, help="Notebook (fuzzy title or ID)")
    query_parser.add_argument("--query", "-q", required=True, help="Query string")
    query_parser.add_argument("--context", "-c", default="general",
                             choices=["general", "skill_building", "essay_writing", "research"],
                             help="Context type for query expansion")
    query_parser.add_argument("--json", action="store_true", help="Output JSON")
    
    # Add source command
    add_parser = subparsers.add_parser("add-source", help="Add source to notebook")
    add_parser.add_argument("--path", "-p", required=True, help="URL, file path, or Drive ID")
    add_parser.add_argument("--json", action="store_true", help="Output JSON")
    
    # Create notebook command
    create_parser = subparsers.add_parser("create", help="Create new notebook")
    create_parser.add_argument("--title", "-t", required=True, help="Notebook title")
    create_parser.add_argument("--json", action="store_true", help="Output JSON")
    
    # Interactive command
    interactive_parser = subparsers.add_parser("interactive", help="Interactive mode")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    client = NotebookLMClient()
    
    if args.command == "list":
        notebooks = client.list_notebooks()
        if args.json:
            print(json.dumps({"notebooks": notebooks}, indent=2))
        else:
            print("📚 Available Notebooks:")
            for nb in notebooks:
                print(f"  • {nb['title']}")
                print(f"    ID: {nb['id']}")
    
    elif args.command == "search":
        result = client.fuzzy_find_notebook(args.query)
        if args.json:
            print(json.dumps(result, indent=2, default=str))
        else:
            if result.get("matched"):
                print(f"🔍 Found notebook:")
                if "title" in result:
                    print(f"  Title: {result['title']}")
                if "id" in result:
                    print(f"  ID: {result['id']}")
                if "confidence" in result:
                    print(f"  Confidence: {result['confidence']}%")
                if "output" in result:
                    print(f"\n{result['output']}")
            else:
                print(f"❌ No notebook matching '{args.query}'")
                if result.get("notebooks"):
                    print("\nAvailable notebooks:")
                    for nb in result["notebooks"][:10]:
                        print(f"  • {nb['title']}")
    
    elif args.command == "query":
        # Query notebook (switches first, then asks)
        print(f"📖 Notebook: {args.notebook}\n")
        
        result = client.query_notebook(args.notebook, args.query, args.context)
        if args.json:
            print(json.dumps(result, indent=2))
        else:
            if not result.get('success'):
                print(f"❌ Error: {result.get('error', 'Unknown error')}")
                exit(1)
            print(f"🔍 Query: {result['query']}")
            print(f"🎯 Enhanced: {result['enhanced']}")
            print(f"📝 Context: {result['context']}\n")
            print("💡 Response:")
            print(result['response'])
    
    elif args.command == "add-source":
        result = client.add_source(args.path)
        if args.json:
            print(json.dumps(result, indent=2))
        else:
            print(result['output'])
    
    elif args.command == "create":
        result = client.create_notebook(args.title)
        if args.json:
            print(json.dumps(result, indent=2))
        else:
            print(result['output'])
    
    elif args.command == "interactive":
        cmd_base = client.notebooklm_cmd
        print("🎓 NotebookLM Interactive Mode")
        print("Commands: list, use <title>, ask <question>, add <source>, quit")
        print("-" * 50)
        
        while True:
            try:
                cmd = input("\nnotebooklm> ").strip()
                if cmd.lower() in ("quit", "exit", "q"):
                    break
                if not cmd:
                    continue
                
                parts = cmd.split(maxsplit=1)
                action = parts[0]
                arg = parts[1] if len(parts) > 1 else ""
                
                cmd_base = self.notebooklm_cmd
                if action == "list":
                    subprocess.run([cmd_base, "list"])
                elif action == "use":
                    subprocess.run([cmd_base, "use", arg])
                elif action == "ask":
                    subprocess.run([cmd_base, "ask", arg])
                elif action == "add":
                    subprocess.run([cmd_base, "source", "add", arg])
                elif action == "status":
                    subprocess.run([cmd_base, "status"])
                else:
                    print(f"Unknown command: {action}")
                    
            except KeyboardInterrupt:
                print("\nGoodbye!")
                break

if __name__ == "__main__":
    main()
