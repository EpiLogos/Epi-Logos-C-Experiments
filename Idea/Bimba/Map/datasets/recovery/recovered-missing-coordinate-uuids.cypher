// c_2_uuid assignment, run AFTER the node MERGE file.
// Keeps the recovered uuid when free; mints a fresh one when taken.

MATCH (n:Bimba {coordinate: 'L0-0\''}) WHERE n.c_2_uuid IS NULL
                   SET n.c_2_uuid = CASE WHEN EXISTS { MATCH (o:Bimba {c_2_uuid: '85b52167-0550-5536-83e3-5c1021e91583'}) }
                     THEN toString(randomUUID()) ELSE '85b52167-0550-5536-83e3-5c1021e91583' END;
MATCH (n:Bimba {coordinate: 'L0-1\''}) WHERE n.c_2_uuid IS NULL
                   SET n.c_2_uuid = CASE WHEN EXISTS { MATCH (o:Bimba {c_2_uuid: 'cc98818a-5902-58bf-b89a-66a27327496f'}) }
                     THEN toString(randomUUID()) ELSE 'cc98818a-5902-58bf-b89a-66a27327496f' END;
MATCH (n:Bimba {coordinate: 'L0-2\''}) WHERE n.c_2_uuid IS NULL
                   SET n.c_2_uuid = CASE WHEN EXISTS { MATCH (o:Bimba {c_2_uuid: 'ac4e8bfb-f963-5ca1-ae5c-a7e242ce30b3'}) }
                     THEN toString(randomUUID()) ELSE 'ac4e8bfb-f963-5ca1-ae5c-a7e242ce30b3' END;
MATCH (n:Bimba {coordinate: 'L0-3\''}) WHERE n.c_2_uuid IS NULL
                   SET n.c_2_uuid = CASE WHEN EXISTS { MATCH (o:Bimba {c_2_uuid: '54007f7c-8fd7-59ec-866e-66bcac644d43'}) }
                     THEN toString(randomUUID()) ELSE '54007f7c-8fd7-59ec-866e-66bcac644d43' END;
MATCH (n:Bimba {coordinate: 'L0-4\''}) WHERE n.c_2_uuid IS NULL
                   SET n.c_2_uuid = CASE WHEN EXISTS { MATCH (o:Bimba {c_2_uuid: 'e1af3614-7c84-5af6-b57d-7001adc3715e'}) }
                     THEN toString(randomUUID()) ELSE 'e1af3614-7c84-5af6-b57d-7001adc3715e' END;
MATCH (n:Bimba {coordinate: 'L0-5\''}) WHERE n.c_2_uuid IS NULL
                   SET n.c_2_uuid = CASE WHEN EXISTS { MATCH (o:Bimba {c_2_uuid: 'b53dffce-2a09-5acc-bdc0-b953a2a98f33'}) }
                     THEN toString(randomUUID()) ELSE 'b53dffce-2a09-5acc-bdc0-b953a2a98f33' END;
MATCH (n:Bimba {coordinate: 'L1-0'}) WHERE n.c_2_uuid IS NULL
                   SET n.c_2_uuid = CASE WHEN EXISTS { MATCH (o:Bimba {c_2_uuid: 'd873c27d-470f-53b0-bbee-88d1a5d9ce16'}) }
                     THEN toString(randomUUID()) ELSE 'd873c27d-470f-53b0-bbee-88d1a5d9ce16' END;
MATCH (n:Bimba {coordinate: 'L1-1'}) WHERE n.c_2_uuid IS NULL
                   SET n.c_2_uuid = CASE WHEN EXISTS { MATCH (o:Bimba {c_2_uuid: 'b2e60a3b-135b-579e-9154-f97356236e96'}) }
                     THEN toString(randomUUID()) ELSE 'b2e60a3b-135b-579e-9154-f97356236e96' END;
MATCH (n:Bimba {coordinate: 'L1-2'}) WHERE n.c_2_uuid IS NULL
                   SET n.c_2_uuid = CASE WHEN EXISTS { MATCH (o:Bimba {c_2_uuid: '5bbba7f6-d17e-592e-a208-f86be4212830'}) }
                     THEN toString(randomUUID()) ELSE '5bbba7f6-d17e-592e-a208-f86be4212830' END;
MATCH (n:Bimba {coordinate: 'L1-3'}) WHERE n.c_2_uuid IS NULL
                   SET n.c_2_uuid = CASE WHEN EXISTS { MATCH (o:Bimba {c_2_uuid: 'e6f583f0-ad08-5325-a02d-efbcde05be90'}) }
                     THEN toString(randomUUID()) ELSE 'e6f583f0-ad08-5325-a02d-efbcde05be90' END;
MATCH (n:Bimba {coordinate: 'L1-4'}) WHERE n.c_2_uuid IS NULL
                   SET n.c_2_uuid = CASE WHEN EXISTS { MATCH (o:Bimba {c_2_uuid: '37863b25-4d55-5624-b2c6-8f60eca1bad8'}) }
                     THEN toString(randomUUID()) ELSE '37863b25-4d55-5624-b2c6-8f60eca1bad8' END;
MATCH (n:Bimba {coordinate: 'L1-5'}) WHERE n.c_2_uuid IS NULL
                   SET n.c_2_uuid = CASE WHEN EXISTS { MATCH (o:Bimba {c_2_uuid: 'cffebd92-8260-5581-9ad7-3f7e1ff77a59'}) }
                     THEN toString(randomUUID()) ELSE 'cffebd92-8260-5581-9ad7-3f7e1ff77a59' END;
MATCH (n:Bimba {coordinate: 'L2-0'}) WHERE n.c_2_uuid IS NULL
                   SET n.c_2_uuid = CASE WHEN EXISTS { MATCH (o:Bimba {c_2_uuid: 'c4b65298-6ae2-5d17-8e6d-a5ac5d368ea2'}) }
                     THEN toString(randomUUID()) ELSE 'c4b65298-6ae2-5d17-8e6d-a5ac5d368ea2' END;
MATCH (n:Bimba {coordinate: 'L2-1'}) WHERE n.c_2_uuid IS NULL
                   SET n.c_2_uuid = CASE WHEN EXISTS { MATCH (o:Bimba {c_2_uuid: '3cd5c70c-8dcc-539f-9e29-1eee864af403'}) }
                     THEN toString(randomUUID()) ELSE '3cd5c70c-8dcc-539f-9e29-1eee864af403' END;
MATCH (n:Bimba {coordinate: 'L2-2'}) WHERE n.c_2_uuid IS NULL
                   SET n.c_2_uuid = CASE WHEN EXISTS { MATCH (o:Bimba {c_2_uuid: '88e4a590-9a8f-5205-9958-6bb7cea781e6'}) }
                     THEN toString(randomUUID()) ELSE '88e4a590-9a8f-5205-9958-6bb7cea781e6' END;
MATCH (n:Bimba {coordinate: 'L2-3'}) WHERE n.c_2_uuid IS NULL
                   SET n.c_2_uuid = CASE WHEN EXISTS { MATCH (o:Bimba {c_2_uuid: '70e73c2a-3b0e-52cc-b34f-1d9d7d03bcd3'}) }
                     THEN toString(randomUUID()) ELSE '70e73c2a-3b0e-52cc-b34f-1d9d7d03bcd3' END;
MATCH (n:Bimba {coordinate: 'L2-4'}) WHERE n.c_2_uuid IS NULL
                   SET n.c_2_uuid = CASE WHEN EXISTS { MATCH (o:Bimba {c_2_uuid: 'cd9e0f26-80c7-5f5a-8a08-d1153a9ee8c2'}) }
                     THEN toString(randomUUID()) ELSE 'cd9e0f26-80c7-5f5a-8a08-d1153a9ee8c2' END;
MATCH (n:Bimba {coordinate: 'L2-5'}) WHERE n.c_2_uuid IS NULL
                   SET n.c_2_uuid = CASE WHEN EXISTS { MATCH (o:Bimba {c_2_uuid: 'c0b8bceb-ec69-57f4-bb75-a02f82c2c79c'}) }
                     THEN toString(randomUUID()) ELSE 'c0b8bceb-ec69-57f4-bb75-a02f82c2c79c' END;
MATCH (n:Bimba {coordinate: 'L3-0'}) WHERE n.c_2_uuid IS NULL
                   SET n.c_2_uuid = CASE WHEN EXISTS { MATCH (o:Bimba {c_2_uuid: '9df73441-5394-59f9-abb4-0b4f997e6930'}) }
                     THEN toString(randomUUID()) ELSE '9df73441-5394-59f9-abb4-0b4f997e6930' END;
MATCH (n:Bimba {coordinate: 'L3-1'}) WHERE n.c_2_uuid IS NULL
                   SET n.c_2_uuid = CASE WHEN EXISTS { MATCH (o:Bimba {c_2_uuid: '5792c370-d24d-58bc-80c3-3976685399a1'}) }
                     THEN toString(randomUUID()) ELSE '5792c370-d24d-58bc-80c3-3976685399a1' END;
MATCH (n:Bimba {coordinate: 'L3-2'}) WHERE n.c_2_uuid IS NULL
                   SET n.c_2_uuid = CASE WHEN EXISTS { MATCH (o:Bimba {c_2_uuid: '64c706a6-8c3e-5d61-a1ba-546a44ed6b7d'}) }
                     THEN toString(randomUUID()) ELSE '64c706a6-8c3e-5d61-a1ba-546a44ed6b7d' END;
MATCH (n:Bimba {coordinate: 'L3-3'}) WHERE n.c_2_uuid IS NULL
                   SET n.c_2_uuid = CASE WHEN EXISTS { MATCH (o:Bimba {c_2_uuid: '6c0b21c2-7b3f-5ef2-8e91-8243be206a63'}) }
                     THEN toString(randomUUID()) ELSE '6c0b21c2-7b3f-5ef2-8e91-8243be206a63' END;
MATCH (n:Bimba {coordinate: 'L3-4'}) WHERE n.c_2_uuid IS NULL
                   SET n.c_2_uuid = CASE WHEN EXISTS { MATCH (o:Bimba {c_2_uuid: '3857adef-5bbc-5125-91ec-9e8115e5c5e1'}) }
                     THEN toString(randomUUID()) ELSE '3857adef-5bbc-5125-91ec-9e8115e5c5e1' END;
MATCH (n:Bimba {coordinate: 'L3-5'}) WHERE n.c_2_uuid IS NULL
                   SET n.c_2_uuid = CASE WHEN EXISTS { MATCH (o:Bimba {c_2_uuid: '83d6142b-b75e-50bd-bc8b-5d473a7bb459'}) }
                     THEN toString(randomUUID()) ELSE '83d6142b-b75e-50bd-bc8b-5d473a7bb459' END;
MATCH (n:Bimba {coordinate: 'L4-0'}) WHERE n.c_2_uuid IS NULL
                   SET n.c_2_uuid = CASE WHEN EXISTS { MATCH (o:Bimba {c_2_uuid: '591371cd-7af2-557e-a694-b5e4c410f30e'}) }
                     THEN toString(randomUUID()) ELSE '591371cd-7af2-557e-a694-b5e4c410f30e' END;
MATCH (n:Bimba {coordinate: 'L4-1'}) WHERE n.c_2_uuid IS NULL
                   SET n.c_2_uuid = CASE WHEN EXISTS { MATCH (o:Bimba {c_2_uuid: '10412d69-bae2-571a-9e13-ff724298176d'}) }
                     THEN toString(randomUUID()) ELSE '10412d69-bae2-571a-9e13-ff724298176d' END;
MATCH (n:Bimba {coordinate: 'L4-2'}) WHERE n.c_2_uuid IS NULL
                   SET n.c_2_uuid = CASE WHEN EXISTS { MATCH (o:Bimba {c_2_uuid: '256a2821-82d0-5c0e-a8d6-9ecf526328d2'}) }
                     THEN toString(randomUUID()) ELSE '256a2821-82d0-5c0e-a8d6-9ecf526328d2' END;
MATCH (n:Bimba {coordinate: 'L4-3'}) WHERE n.c_2_uuid IS NULL
                   SET n.c_2_uuid = CASE WHEN EXISTS { MATCH (o:Bimba {c_2_uuid: '48676352-c606-521c-b289-f36c51a41811'}) }
                     THEN toString(randomUUID()) ELSE '48676352-c606-521c-b289-f36c51a41811' END;
MATCH (n:Bimba {coordinate: 'L4-4'}) WHERE n.c_2_uuid IS NULL
                   SET n.c_2_uuid = CASE WHEN EXISTS { MATCH (o:Bimba {c_2_uuid: 'c64bc634-5b8e-5041-9f8e-f3cc0b8d18a7'}) }
                     THEN toString(randomUUID()) ELSE 'c64bc634-5b8e-5041-9f8e-f3cc0b8d18a7' END;
MATCH (n:Bimba {coordinate: 'L4-5'}) WHERE n.c_2_uuid IS NULL
                   SET n.c_2_uuid = CASE WHEN EXISTS { MATCH (o:Bimba {c_2_uuid: '128e1847-0a87-5d86-9def-a17e83a10090'}) }
                     THEN toString(randomUUID()) ELSE '128e1847-0a87-5d86-9def-a17e83a10090' END;
MATCH (n:Bimba {coordinate: 'L5-0'}) WHERE n.c_2_uuid IS NULL
                   SET n.c_2_uuid = CASE WHEN EXISTS { MATCH (o:Bimba {c_2_uuid: 'b06091fd-7d5b-529d-bc5a-a85e5dab02e2'}) }
                     THEN toString(randomUUID()) ELSE 'b06091fd-7d5b-529d-bc5a-a85e5dab02e2' END;
MATCH (n:Bimba {coordinate: 'L5-1'}) WHERE n.c_2_uuid IS NULL
                   SET n.c_2_uuid = CASE WHEN EXISTS { MATCH (o:Bimba {c_2_uuid: 'b88fdc2a-a3fe-5215-82ba-897e7fe0bc9a'}) }
                     THEN toString(randomUUID()) ELSE 'b88fdc2a-a3fe-5215-82ba-897e7fe0bc9a' END;
MATCH (n:Bimba {coordinate: 'L5-2'}) WHERE n.c_2_uuid IS NULL
                   SET n.c_2_uuid = CASE WHEN EXISTS { MATCH (o:Bimba {c_2_uuid: 'c9959484-c67c-5559-9e61-f94bb6337304'}) }
                     THEN toString(randomUUID()) ELSE 'c9959484-c67c-5559-9e61-f94bb6337304' END;
MATCH (n:Bimba {coordinate: 'L5-3'}) WHERE n.c_2_uuid IS NULL
                   SET n.c_2_uuid = CASE WHEN EXISTS { MATCH (o:Bimba {c_2_uuid: 'd663cd3b-dcd4-5b4e-9a06-1463f4443c85'}) }
                     THEN toString(randomUUID()) ELSE 'd663cd3b-dcd4-5b4e-9a06-1463f4443c85' END;
MATCH (n:Bimba {coordinate: 'L5-4'}) WHERE n.c_2_uuid IS NULL
                   SET n.c_2_uuid = CASE WHEN EXISTS { MATCH (o:Bimba {c_2_uuid: '35f6abaa-7267-522a-80cb-52fd68cba892'}) }
                     THEN toString(randomUUID()) ELSE '35f6abaa-7267-522a-80cb-52fd68cba892' END;
MATCH (n:Bimba {coordinate: 'L5-5'}) WHERE n.c_2_uuid IS NULL
                   SET n.c_2_uuid = CASE WHEN EXISTS { MATCH (o:Bimba {c_2_uuid: '2b8742a3-b455-5c09-9ef7-a3a6c15cb345'}) }
                     THEN toString(randomUUID()) ELSE '2b8742a3-b455-5c09-9ef7-a3a6c15cb345' END;

// Any restored node the log carried no uuid for.
MATCH (n:Bimba) WHERE n.c_2_uuid IS NULL SET n.c_2_uuid = toString(randomUUID());
