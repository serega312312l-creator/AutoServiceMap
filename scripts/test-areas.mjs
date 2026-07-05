const regions = ["UA-32", "UA-30", "UA-46"];

for (const code of regions) {
  const q = `[out:json][timeout:120];
area["ISO3166-2"="${code}"]->.searchArea;
(node(area.searchArea)[shop=car_repair];way(area.searchArea)[shop=car_repair];);
out center tags;`;

  const response = await fetch("https://overpass.kumi.systems/api/interpreter", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "AVTOGID/1.0",
    },
    body: `data=${encodeURIComponent(q)}`,
  });

  const data = await response.json();
  console.log(code, response.status, data.elements?.length ?? 0);
}
