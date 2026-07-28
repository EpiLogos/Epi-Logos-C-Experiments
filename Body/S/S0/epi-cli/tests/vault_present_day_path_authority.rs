//! The Present day folder is FLAT and month-first — `Idea/Empty/Present/{MM-DD-YYYY}`
//! (CHARTER:28, Architect-ratified 2026-07-02) — and only the History archive
//! nests, under `{YYYY}/{MM}/W{week}/{DD}`. Both halves of that law had been
//! stated for a long time; both broke anyway, so this file makes breaking either
//! a build failure rather than a thing someone notices weeks later.
//!
//! Three separate drifts, one disease — a duplicated authority nobody kept equal:
//!   * SHAPE: `vault/day.rs` grew a second day-path constructor (below).
//!   * FORMAT: epi-cli spelled the day id `%d-%m-%Y` at TEN sites while the
//!     pratibimba-app carrier used CHARTER's `%m-%d-%Y`, so the CLI and the app
//!     wrote different day folders on every day whose day-of-month ≠ month.
//!   * INSTANT: with shape and format both cured, the two still disagreed about
//!     WHICH DAY IT IS — epi-cli reduced a `DateTime<Utc>` to the UTC calendar
//!     date while the carrier and the m-dev tooling read the LOCAL one, so every
//!     instant between local midnight and UTC midnight named a different day.
//!     Caught live 2026-07-28 at 00:56 BST, when `epi agent session init` wrote
//!     into the previous day and `--require-now` then hard-stopped the session
//!     as STALE against the NOW it had just created.
//!
//! How it broke: `vault/day.rs` grew a SECOND day-path constructor that applied
//! the archive's year/month/week/day shape to the Present root. Nothing kept the
//! two copies equal, so the vault split in half — `epi vault day-init` and
//! `archive-day` used the nested path, while session init, the S5 agent core and
//! the autoresearch spine used the flat one. `day-init` therefore wrote day
//! folders no other component ever read, and its own unit test asserted the
//! nested path, so the bug shipped with a green test protecting it.
//!
//! The structural fix is one constructor. These tests hold that: the behaviour
//! of the authority, the archive's nesting kept intact so nobody "repairs" the
//! wrong side, and a source scan that fails when a second constructor appears.

use chrono::{DateTime, Local, NaiveDate, TimeZone, Utc};
use epi_logos::vault::paths::{
    archive_day_path, day_folder, day_folder_for_date, day_note_path, format_day_id,
    format_day_id_for_date, parse_day_id, DAY_ID_FORMAT,
};
use std::path::{Path, PathBuf};

const AUTHORITY: &str = "src/vault/paths.rs";

/// The carrier's own day-id formatter. epi-cli and the app write into the SAME
/// `Idea/Empty/Present/{day_id}/`, so if these two disagree they silently build
/// two different day folders — which they did: the app used month-first per
/// CHARTER while epi-cli spelled day-first at ten separate sites.
const CARRIER_VAULT_RS: &str = "../../../M/pratibimba-app/src-tauri/src/vault.rs";

/// THE THIRD DRIFT — INSTANT. Shape and format were both fixed while the two
/// authorities still disagreed about *which day it is*.
///
/// The vault day is a LIVED day: the carrier mints it from `chrono::Local::now()`
/// (`pratibimba-app/src-tauri/src/vault.rs`), and the m-dev tooling
/// (`.codex/scripts/m-dev-plan-assess.mjs` `presentDayId`) reads the LOCAL
/// calendar date too. epi-cli instead took `.date_naive()` off a `DateTime<Utc>`,
/// which is the UTC calendar date — so for every instant between local midnight
/// and UTC midnight the CLI named YESTERDAY while the app and the tooling named
/// today. Observed live 2026-07-28 at 00:56 BST: `epi agent session init` wrote
/// into the previous day while `--require-now` hard-stopped the session as STALE
/// against its own freshly-created NOW.
///
/// Both cases below are required to make this portable: the 00:30 case fails
/// under UTC-derived code in any zone EAST of UTC, the 23:30 case in any zone
/// WEST of it. Together they pin the law wherever the test runs.
#[test]
fn day_id_follows_the_local_calendar_day_never_utc() {
    let day = NaiveDate::from_ymd_opt(2026, 7, 28).unwrap();
    for (hour, minute) in [(0, 30), (23, 30)] {
        let wall_clock = day.and_hms_opt(hour, minute, 0).unwrap();
        let local_dt = Local
            .from_local_datetime(&wall_clock)
            .single()
            .expect("2026-07-28 carries no DST transition in any zone");
        let instant: DateTime<Utc> = local_dt.with_timezone(&Utc);

        assert_eq!(
            format_day_id(instant),
            "07-28-2026",
            "at {hour:02}:{minute:02} local the vault day is the LOCAL day, \
             not the UTC day ({} UTC)",
            instant.date_naive()
        );
        assert_eq!(
            day_folder(Path::new("/vault"), instant),
            Path::new("/vault/Empty/Present/07-28-2026"),
            "the day FOLDER follows the same local day as the day id"
        );
    }
}

#[test]
fn day_id_is_month_first_per_charter() {
    // CHARTER.md:28 — month-first MM-DD-YYYY, Architect-ratified 2026-07-02,
    // explicitly superseding the older DD-MM spelling.
    assert_eq!(DAY_ID_FORMAT, "%m-%d-%Y");
    let day = NaiveDate::from_ymd_opt(2026, 7, 27).unwrap();
    assert_eq!(
        format_day_id_for_date(day),
        "07-27-2026",
        "27 July renders month-first"
    );
}

#[test]
fn day_id_parse_round_trips_and_still_reads_legacy_folders() {
    let day = NaiveDate::from_ymd_opt(2026, 7, 27).unwrap();
    assert_eq!(parse_day_id(&format_day_id_for_date(day)).unwrap(), day);
    // pre-CHARTER day-first folders and ISO receipts must still resolve
    assert_eq!(parse_day_id("27-07-2026").unwrap(), day);
    assert_eq!(parse_day_id("2026-07-27").unwrap(), day);
    // ambiguous reads month-first per CHARTER
    assert_eq!(
        parse_day_id("07-05-2026").unwrap(),
        NaiveDate::from_ymd_opt(2026, 7, 5).unwrap()
    );
    assert!(parse_day_id("nonsense").is_err());
}

/// Every OTHER place in the repo that spells the day id. Four independent
/// spellings existed; the first fix caught two, and the remaining two only
/// surfaced when a month-first id reached them at runtime — the gateway PANICKED
/// (`month = 27` indexed a 12-element month table) and the m-dev harness
/// declared a same-day NOW stale. Each entry pins the month-first order in the
/// form that file writes it.
const OTHER_DAY_ID_SPELLINGS: &[(&str, &str, &str)] = &[
    (
        "gateway temporal_context.rs",
        "../../S3/gateway/src/temporal_context.rs",
        "let month: u32 = parts.next()?.parse().ok()?;",
    ),
    (
        "m-dev harness presentDayId",
        "../../../../.codex/scripts/m-dev-plan-assess.mjs",
        "return `${mm}-${dd}-${date.getFullYear()}`;",
    ),
];

#[test]
fn every_other_day_id_spelling_in_the_repo_is_month_first() {
    for (label, relative, expected) in OTHER_DAY_ID_SPELLINGS {
        let path = Path::new(env!("CARGO_MANIFEST_DIR")).join(relative);
        let body = std::fs::read_to_string(&path).unwrap_or_else(|err| {
            panic!("{label}: cannot read {} ({err}) — update the path", path.display())
        });
        assert!(
            body.contains(expected),
            "{label} ({}) must spell the day id MONTH-FIRST; expected to find:\n  {expected}\n\
             All spellings must agree with vault::paths::DAY_ID_FORMAT ({DAY_ID_FORMAT}) — \
             they write and read the same Idea/Empty/Present/{{day_id}}/ folders.",
            path.display()
        );
    }
}

/// The CLI and the carrier must spell the day id the same way. This reads the
/// carrier's source rather than trusting a comment.
#[test]
fn cli_and_carrier_agree_on_the_day_id_format() {
    let carrier = Path::new(env!("CARGO_MANIFEST_DIR")).join(CARRIER_VAULT_RS);
    let Ok(body) = std::fs::read_to_string(&carrier) else {
        // the carrier is a sibling crate; if it moves, say so rather than
        // passing silently on a path that no longer exists
        panic!(
            "carrier vault source not found at {} — update CARRIER_VAULT_RS",
            carrier.display()
        );
    };
    assert!(
        body.contains(DAY_ID_FORMAT),
        "the pratibimba-app carrier must format day ids as {DAY_ID_FORMAT} (CHARTER \
         month-first); it and epi-cli write into the same Empty/Present/{{day_id}}/"
    );
    assert!(
        !body.contains("\"%d-%m-%Y\""),
        "the carrier still carries a day-first format literal — the two crates \
         would build different day folders"
    );

    // Agreeing on the FORMAT is not enough if the two disagree about which
    // INSTANT the day is taken from — that is the third drift (see
    // `day_id_follows_the_local_calendar_day_never_utc`). The carrier reduces
    // `chrono::Local::now()`; epi-cli must reduce through `day_of`, which does
    // the same. A carrier that switched to `Utc::now()` would silently re-open
    // the split for everyone east or west of UTC.
    assert!(
        body.contains("Local::now()"),
        "the carrier must take its day from the LOCAL clock; epi-cli's `day_of` \
         reduces to the local calendar day and the two write the same folder"
    );
}

#[test]
fn present_day_folder_is_a_single_flat_day_segment() {
    let vault = PathBuf::from("/tmp/vault");
    let day = NaiveDate::from_ymd_opt(2026, 3, 10).unwrap();

    assert_eq!(
        day_folder_for_date(&vault, day),
        vault.join("Empty/Present/03-10-2026"),
        "Present is flat: ONE day-id segment under Empty/Present (month-first)"
    );

    // the DateTime entry point must agree with the NaiveDate core
    let now = Utc.with_ymd_and_hms(2026, 3, 10, 9, 8, 7).unwrap();
    assert_eq!(day_folder(&vault, now), day_folder_for_date(&vault, day));
    assert_eq!(
        day_note_path(&vault, now),
        vault.join("Empty/Present/03-10-2026/daily-note.md")
    );
}

#[test]
fn no_present_path_segment_is_a_year_month_or_week() {
    let vault = PathBuf::from("/tmp/vault");
    // a week-51 date in a two-digit month — the shape most likely to be
    // mistaken for the archive's
    let day = NaiveDate::from_ymd_opt(2026, 12, 17).unwrap();
    let folder = day_folder_for_date(&vault, day);

    let tail: Vec<String> = folder
        .strip_prefix(&vault)
        .expect("day folder sits under the vault root")
        .components()
        .map(|c| c.as_os_str().to_string_lossy().into_owned())
        .collect();

    assert_eq!(
        tail,
        vec!["Empty", "Present", "12-17-2026"],
        "exactly three segments; a year/month/W-week chain here is the archive \
         shape applied to the wrong root"
    );
    for segment in &tail {
        assert!(
            !segment.starts_with('W') || segment == "12-17-2026",
            "no ISO-week segment belongs under Present: {segment}"
        );
    }
}

#[test]
fn archive_keeps_its_nesting_and_never_lives_under_present() {
    let vault = PathBuf::from("/tmp/vault");
    let day = NaiveDate::from_ymd_opt(2026, 3, 10).unwrap();
    let archive = archive_day_path(&vault, day);

    // the nesting is CORRECT here — this test exists so a future reader who
    // sees "flatten the day path" does not flatten the archive too.
    assert_eq!(
        archive,
        vault.join("Pratibimba/Self/Action/History/2026/03/W11/10"),
        "History nests by year/month/ISO-week/day — that is the archive's law"
    );
    assert!(
        !archive.starts_with(vault.join("Empty/Present")),
        "the archive is rooted at Pratibimba/Self/Action/History, never under Present"
    );
}

/// Files allowed to name Present without going through the authority, because
/// what they build is NOT a day folder. Each entry states the artifact; a new
/// entry is a claim that something other than a day lives directly under
/// Present, and should be argued for rather than added to silence this test.
const NON_DAY_FOLDER_USES: &[(&str, &str)] = &[
    (
        "src/vault/mod.rs",
        "Empty/Present/NOW.md — the top-level NOW pointer, not a dated folder",
    ),
    (
        "src/portal/plugins/m4.rs",
        "Empty/Present/FLOW.md — the flow note, not a dated folder",
    ),
];

/// Walk the crate's own sources and fail when anything other than the authority
/// module constructs a Present path. One constructor is the whole point: the
/// previous bug was only possible because there were two. Test modules are
/// skipped — fixtures may spell paths out literally, and asserting on a literal
/// is how you catch a wrong constructor, not how you become one.
#[test]
fn only_the_authority_module_constructs_a_present_path() {
    let src = Path::new(env!("CARGO_MANIFEST_DIR")).join("src");
    let mut offenders = Vec::new();
    let mut authority_seen = false;

    for file in rust_sources(&src) {
        let body = std::fs::read_to_string(&file).expect("read source");
        // production half only: everything from `#[cfg(test)]` on is fixtures
        let production = match body.find("#[cfg(test)]") {
            Some(cut) => &body[..cut],
            None => &body[..],
        };
        if !production.contains(r#".join("Present")"#) {
            continue;
        }
        let relative = file
            .strip_prefix(env!("CARGO_MANIFEST_DIR"))
            .unwrap_or(&file)
            .to_string_lossy()
            .replace('\\', "/");
        if relative == AUTHORITY {
            authority_seen = true;
        } else if !NON_DAY_FOLDER_USES.iter().any(|(path, _)| *path == relative) {
            offenders.push(relative);
        }
    }

    assert!(
        authority_seen,
        "{AUTHORITY} must own the Present day-path construction — this guard is \
         useless if the authority moved without updating it"
    );
    assert!(
        offenders.is_empty(),
        "only {AUTHORITY} may build a Present path; call \
         vault::paths::day_folder_for_date instead of joining your own. \
         Offenders: {offenders:?}"
    );
}

fn rust_sources(dir: &Path) -> Vec<PathBuf> {
    let mut files = Vec::new();
    let mut stack = vec![dir.to_path_buf()];
    while let Some(current) = stack.pop() {
        let Ok(entries) = std::fs::read_dir(&current) else {
            continue;
        };
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                stack.push(path);
            } else if path.extension().is_some_and(|ext| ext == "rs") {
                files.push(path);
            }
        }
    }
    files
}
