"""Coordinate-tagging tests for the Gnostic namespace storage seam."""

from epi_gnostic.storage.neo4j_vector import vector_row_for_item


def test_vector_row_preserves_bimba_coordinate_and_resonances():
    row = vector_row_for_item(
        "library-M5-0",
        {
            "content": "Library surface under the traversed coordinate.",
            "embedding": [0.1, 0.2],
            "bimba_coordinate": "M5-0",
            "bimba_resonances": ["M0", "S5/S5'", "M0"],
        },
        meta_fields=(),
    )

    assert row["vector_id"] == "library-M5-0"
    assert row["content"] == "Library surface under the traversed coordinate."
    assert row["bimba_coordinate"] == "M5-0"
    assert row["bimba_resonances"] == ["M0", "S5/S5'"]
    assert row["embedding"] == [0.1, 0.2]
