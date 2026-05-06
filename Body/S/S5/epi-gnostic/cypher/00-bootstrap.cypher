// 00-bootstrap.cypher — idempotent DDL. Safe to re-run.

CREATE CONSTRAINT bimba_coordinate_unique IF NOT EXISTS
  FOR (n:BimbaNode) REQUIRE n.coordinate IS UNIQUE;

CREATE INDEX bimba_family IF NOT EXISTS
  FOR (n:BimbaNode) ON (n.c_4_family);

CREATE INDEX bimba_ql_position IF NOT EXISTS
  FOR (n:BimbaNode) ON (n.c_4_ql_position);


CREATE VECTOR INDEX bimba_embedding IF NOT EXISTS
  FOR (n:BimbaNode) ON n.c_5_embedding
  OPTIONS {
    indexConfig: {
      `vector.dimensions`: 3072,
      `vector.similarity_function`: 'cosine'
    }
  };
