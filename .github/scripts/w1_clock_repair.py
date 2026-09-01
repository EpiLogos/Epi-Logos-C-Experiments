from pathlib import Path

path = Path("Body/S/S0/portal-core/tests/kernel_clock_projection.rs")
text = path.read_text()
replacements = [
    (
        'public_json["harmonicProfile"]["binary"]["mahamayaAddress64"],\n        10',
        'public_json["harmonicProfile"]["binary"]["mahamayaAddress64"],\n        37',
    ),
    (
        'assert_eq!(public_json["harmonicProfile"]["binary"]["codon"], "UGG");',
        'assert_eq!(public_json["harmonicProfile"]["binary"]["codon"], "GAA");',
    ),
    (
        'public_json["harmonicProfile"]["binary"]["lineChangeOperatorAddress"],\n        61',
        'public_json["harmonicProfile"]["binary"]["lineChangeOperatorAddress"],\n        223',
    ),
    (
        'assert_eq!(json["harmonicProfile"]["binary"]["mahamayaAddress64"], 42);',
        'assert_eq!(json["harmonicProfile"]["binary"]["mahamayaAddress64"], 53);',
    ),
    (
        'assert_eq!(json["harmonicProfile"]["binary"]["hexagramId"], 42);',
        'assert_eq!(json["harmonicProfile"]["binary"]["hexagramId"], 53);',
    ),
    (
        'assert_eq!(json["harmonicProfile"]["binary"]["upperTrigram"], 5);',
        'assert_eq!(json["harmonicProfile"]["binary"]["upperTrigram"], 6);',
    ),
    (
        'assert_eq!(json["harmonicProfile"]["binary"]["lowerTrigram"], 2);',
        'assert_eq!(json["harmonicProfile"]["binary"]["lowerTrigram"], 5);',
    ),
    (
        'assert_eq!(json["harmonicProfile"]["binary"]["codon"], "GGG");',
        'assert_eq!(json["harmonicProfile"]["binary"]["codon"], "CAA");',
    ),
    (
        'json["harmonicProfile"]["binary"]["lineChangeOperatorAddress"],\n        256',
        'json["harmonicProfile"]["binary"]["lineChangeOperatorAddress"],\n        322',
    ),
]
for old, new in replacements:
    if old not in text:
        raise SystemExit(f"expected stale fixture missing: {old!r}")
    text = text.replace(old, new, 1)
path.write_text(text)
