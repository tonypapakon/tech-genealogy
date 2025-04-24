// immediately-invoked so our vars don’t leak
(function(){
  const margin = { top: 50, right: 50, bottom: 50, left: 150 };
  const fullW  = window.innerWidth;
  const fullH  = window.innerHeight;
  const width  = fullW  - margin.left - margin.right;
  const height = fullH - margin.top  - margin.bottom;

  // svg + zoom container
  const svg = d3.select("#tree")
    .append("svg")
      .attr("width",  fullW)
      .attr("height", fullH)
      .call(d3.zoom()
        .scaleExtent([0.5, 4])
        .on("zoom", e => g.attr("transform", e.transform))
      );

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // load JSON
  d3.json("/static/data/events.json").then(raw => {
    raw.forEach(d => d.year = +d.year);

    // turn it into a tree
    const stratify = d3.stratify()
      .id(d => d.id)
      .parentId(d => d.parent);
    const root = stratify(raw);

    // horizontal = time scale
    const years = raw.map(d => d.year);
    const xScale = d3.scaleLinear()
      .domain([ d3.min(years), d3.max(years) ])
      .range([ 0, width ]);
      
    // create an array of all years
    const allYears = d3.range(d3.min(years), d3.max(years) + 1);

    // vertical spacing
    const tree = d3.tree()
      .nodeSize([100, 500]) // increase horizontal spacing between nodes
      .separation((a, b) => a.parent === b.parent ? 1 : 1.5); // adjust separation between sibling and non-sibling nodes

    tree(root);

    // override each node’s y by its year
    root.descendants().forEach(d => d.y = xScale(d.data.year));

    // Compute the maximum x so we know where the last node sits vertically.
    const maxX = d3.max(root.descendants(), d => d.x);

    // Draw dotted vertical gridlines from each tick to the top of the tree.
    g.selectAll(".x-grid")
      .data(xScale.ticks())
      .enter().append("line")
        .attr("class", "x-grid")
        .attr("x1", d => xScale(d))
        .attr("x2", d => xScale(d))
        .attr("y1", -400)
        .attr("y2", maxX + 20)
        .style("stroke", "gray")
        .style("stroke-dasharray", "3,3");

    // bottom time axis placed right below the lowest node
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d3.format("d"));

    g.append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0, ${maxX + 20})`)
      .call(xAxis)
      .selectAll("text")
      .style("fill", "white");

    // draw links
    g.selectAll(".link")
      .data(root.links())
      .enter().append("path")
        .attr("class", "link")
        .attr("d", d3.linkHorizontal()
          .x(d => d.y)
          .y(d => d.x)
        );

    // draw nodes
    const node = g.selectAll(".node")
      .data(root.descendants())
      .enter().append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.y},${d.x})`)
        .style("cursor", d => d.data.wiki_link ? "pointer" : "default")
        .on("click", (event, d) => {
          if (d.data.wiki_link) window.open(d.data.wiki_link, "_blank");
        });

    node.append("circle")
      .attr("r", 10)
      .attr("fill", "white")
      .attr("stroke", "#333")
      .attr("stroke-width", 2);

    node.append("text")
      .attr("dy", 4)
      .attr("x", d => d.children ? -15 : 15)
      .style("text-anchor", d => d.children ? "end" : "start")
      .text(d => d.data.name);

  })
  .catch(err => console.error("failed to load data:", err));
})();