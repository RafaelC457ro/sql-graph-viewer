
import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import { folders, files } from "./schema";
import { eq, inArray } from "drizzle-orm";

const sqlite = new Database("data/sqlite.db");
const db = drizzle(sqlite);

async function seed() {
  console.log("Seeding database...");

  // 1. Clean up existing "Sample Queries" folder(s) if they exist
  console.log("Cleaning up 'Sample Queries' folder(s)...");
  const existingFolders = await db.select().from(folders).where(eq(folders.name, "Sample Queries"));
  
  if (existingFolders.length > 0) {
    const folderIds = existingFolders.map(f => f.id);
    console.log(`Deleting ${folderIds.length} existing folder(s) and their files...`);
    
    // Explicitly delete files first
    await db.delete(files).where(inArray(files.folderId, folderIds));
    // Then delete folders
    await db.delete(folders).where(inArray(folders.id, folderIds));
  }

  // 2. Create "Sample Queries" folder
  const [folder] = await db.insert(folders).values({
    name: "Sample Queries",
  }).returning();

  if (!folder) {
    throw new Error("Failed to create folder");
  }

  // 3. Define complex queries
  const queries = [
    {
      name: "1. Setup: Create GOT Graph",
      content: `LOAD 'age';\n\nSET search_path = ag_catalog, "$user", public;\n\nSELECT create_graph('got_demo');`,
      isFavorite: false,
    },
    {
      name: "2. Setup: Create Houses",
      content: `SELECT * FROM cypher('got_demo', $$
  CREATE (:House {name: 'Stark', region: 'The North', words: 'Winter is Coming'}),
         (:House {name: 'Lannister', region: 'The Westerlands', words: 'Hear Me Roar!'}),
         (:House {name: 'Targaryen', region: 'Crownlands', words: 'Fire and Blood'}),
         (:House {name: 'Baratheon', region: 'The Stormlands', words: 'Ours is the Fury'})
$$) as (n agtype);`,
      isFavorite: false,
    },
    {
      name: "3. Setup: Create Characters",
      content: `SELECT * FROM cypher('got_demo', $$
  CREATE (:Character {name: 'Eddard Stark', title: 'Lord of Winterfell', status: 'Deceased'}),
         (:Character {name: 'Catelyn Stark', title: 'Lady of Winterfell', status: 'Deceased'}),
         (:Character {name: 'Jon Snow', title: 'King in the North', status: 'Alive'}),
         (:Character {name: 'Arya Stark', title: 'No One', status: 'Alive'}),
         (:Character {name: 'Sansa Stark', title: 'Lady of Winterfell', status: 'Alive'}),
         (:Character {name: 'Tyrion Lannister', title: 'Hand of the King', status: 'Alive'}),
         (:Character {name: 'Cersei Lannister', title: 'Queen of the Seven Kingdoms', status: 'Alive'}),
         (:Character {name: 'Jaime Lannister', title: 'Lord Commander', status: 'Alive'}),
         (:Character {name: 'Daenerys Targaryen', title: 'Mother of Dragons', status: 'Alive'}),
         (:Character {name: 'Robert Baratheon', title: 'King of the Andals', status: 'Deceased'})
$$) as (n agtype);`,
      isFavorite: false,
    },
    {
      name: "4. Setup: Create Relationships",
      content: `SELECT * FROM cypher('got_demo', $$
  MATCH (ned:Character {name: 'Eddard Stark'}), (cat:Character {name: 'Catelyn Stark'}),
        (jon:Character {name: 'Jon Snow'}), (arya:Character {name: 'Arya Stark'}),
        (sansa:Character {name: 'Sansa Stark'}),
        (stark:House {name: 'Stark'})
  CREATE (ned)-[:MARRIED_TO]->(cat),
         (ned)-[:BELONGS_TO]->(stark),
         (cat)-[:BELONGS_TO]->(stark),
         (jon)-[:BELONGS_TO]->(stark),
         (arya)-[:BELONGS_TO]->(stark),
         (sansa)-[:BELONGS_TO]->(stark),
         (ned)-[:FATHER_OF]->(jon),
         (ned)-[:FATHER_OF]->(arya),
         (ned)-[:FATHER_OF]->(sansa),
         (cat)-[:MOTHER_OF]->(arya),
         (cat)-[:MOTHER_OF]->(sansa)
$$) as (e agtype);

SELECT * FROM cypher('got_demo', $$
  MATCH (tyrion:Character {name: 'Tyrion Lannister'}), (cersei:Character {name: 'Cersei Lannister'}),
        (jaime:Character {name: 'Jaime Lannister'}),
        (lannister:House {name: 'Lannister'})
  CREATE (tyrion)-[:BELONGS_TO]->(lannister),
         (cersei)-[:BELONGS_TO]->(lannister),
         (jaime)-[:BELONGS_TO]->(lannister),
         (cersei)-[:SIBLING_OF]->(jaime),
         (jaime)-[:SIBLING_OF]->(tyrion),
         (tyrion)-[:SIBLING_OF]->(cersei)
$$) as (e agtype);

SELECT * FROM cypher('got_demo', $$
  MATCH (sansa:Character {name: 'Sansa Stark'}), (tyrion:Character {name: 'Tyrion Lannister'})
  CREATE (sansa)-[:MARRIED_TO]->(tyrion)
$$) as (e agtype);

SELECT * FROM cypher('got_demo', $$
  MATCH (dany:Character {name: 'Daenerys Targaryen'}), (targaryen:House {name: 'Targaryen'})
  CREATE (dany)-[:BELONGS_TO]->(targaryen)
$$) as (e agtype);`,
      isFavorite: false,
    },
    {
      name: "5. Query: Family Tree",
      content: `SELECT * FROM cypher('got_demo', $$
  MATCH (parent:Character)-[r]->(child:Character)
  WHERE type(r) = 'FATHER_OF' OR type(r) = 'MOTHER_OF'
  RETURN parent.name, type(r), child.name
$$) as (parent agtype, relation agtype, child agtype);`,
      isFavorite: false,
    },
    {
      name: "6. Query: House Members",
      content: `SELECT * FROM cypher('got_demo', $$
  MATCH (c:Character)-[:BELONGS_TO]->(h:House)
  RETURN h.name AS House, count(c) AS MemberCount, collect(c.name) AS Members
$$) as (House agtype, MemberCount agtype, Members agtype);`,
      isFavorite: false,
    },
    {
      name: "7. Query: Path Finding",
      content: `SELECT * FROM cypher('got_demo', $$
  MATCH p = (a:Character {name: 'Jon Snow'})-[*1..3]-(b:Character {name: 'Tyrion Lannister'})
  RETURN p
$$) as (path agtype);`,
      isFavorite: false,
    },
    {
      name: "8. Query: Complex Filtering",
      content: `SELECT * FROM cypher('got_demo', $$
  MATCH (c:Character)-[:BELONGS_TO]->(h:House)
  WHERE h.name = 'Stark' AND c.status = 'Alive'
  RETURN c.name, c.title
$$) as (Name agtype, Title agtype);`,
      isFavorite: false,
    },
    {
      name: "9. Teardown: Drop Graph",
      content: `SELECT drop_graph('got_demo', true);`,
      isFavorite: false,
    }
  ];

  // Insert files
  await db.insert(files).values(
    queries.map(q => ({
      name: q.name,
      content: q.content,
      folderId: folder.id,
      isFavorite: q.isFavorite,
    }))
  );

  console.log("Seeding complete!");
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
