
const AGE_REGEX = /::(vertex|edge|path)\s*$/;

function parseAgeValue(val) {
  const match = val.match(AGE_REGEX);
  if (!match) return val;

  const type = match[1];
  let jsonPart = val.replace(AGE_REGEX, "").trim();

  try {
    if (type === "path") {
      const transformed = jsonPart
        .replace(/\}::vertex/g, ', "__agKind": "vertex"}')
        .replace(/\}::edge/g, ', "__agKind": "edge"}');
      
      const parsed = JSON.parse(transformed);
      if (Array.isArray(parsed)) {
        return {
          __agKind: "path",
          elements: parsed,
        };
      }
    } else {
      if (
        jsonPart.startsWith("{") ||
        jsonPart.startsWith("[") ||
        jsonPart === "null"
      ) {
        const parsed = JSON.parse(jsonPart);
        if (parsed && typeof parsed === "object") {
          return {
            ...parsed,
            __agKind: type,
          };
        }
      }
    }
  } catch (e) {
    console.error("Parse error:", e);
  }

  return val;
}

const testVal = '[{"id": 844424930131971, "label": "Person", "properties": {"id": "105eda75-f7f6-4ddb-83e3-9c1d02c9bf99", "name": "Carol Williams"}}::vertex, {"id": 1688849860263939, "label": "KNOWS", "end_id": 844424930131971, "start_id": 844424930131970, "properties": {"context": "Former coworkers"}}::edge, {"id": 844424930131972, "label": "Person", "properties": {"id": "f9fd5490-1528-404e-9903-f750f447fc52", "name": "David Kim"}}::vertex]::path';

const result = parseAgeValue(testVal);
console.log(JSON.stringify(result, null, 2));

if (result.__agKind === "path" && result.elements.length === 3) {
    console.log("SUCCESS: Path parsed correctly");
} else {
    console.log("FAILURE: Path not parsed correctly");
}
