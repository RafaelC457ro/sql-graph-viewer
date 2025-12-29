SELECT * FROM cypher('graph_name', $$ CREATE (n:Person {name: 'Andres'}) RETURN n $$);
