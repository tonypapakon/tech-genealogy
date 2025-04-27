// immediately-invoked so our vars don’t leak
(function(){
  let root;

  const margin = { top: 50, right: 50, bottom: 50, left: 150 };
  const fullW  = window.innerWidth;
  const fullH  = window.innerHeight;
  const width  = fullW  - margin.left - margin.right;
  const height = fullH - margin.top  - margin.bottom;

  // svg + zoom container
  const svg = d3.select("#tree")
    .append("svg")
      .attr("width",  fullW)
      .attr("height", fullH);

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // zoom behavior
  const zoom = d3.zoom()
    .scaleExtent([0.5, 4])
    .on("zoom", e => g.attr("transform", e.transform));

  svg.call(zoom);

  // load JSON
  d3.json("/static/data/events.json").then(raw => {
    raw.forEach(d => d.year = +d.year);

    // turn it into a tree
    const stratify = d3.stratify()
      .id(d => d.id)
      .parentId(d => d.parent);
    root = stratify(raw);

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

    // Jitter nodes with the same year to avoid overlap
    const yearCounts = {};
    root.descendants().forEach(d => {
      const year = d.data.year;
      if (!yearCounts[year]) yearCounts[year] = 0;
      yearCounts[year]++;
    });
    const yearOffsets = {};
    root.descendants().forEach(d => {
      const year = d.data.year;
      if (!yearOffsets[year]) yearOffsets[year] = 0;
      // Spread nodes with the same year vertically by a small offset
      d.y += (yearOffsets[year] - (yearCounts[year] - 1) / 2) * 20;
      yearOffsets[year]++;
    });

    // Set a minimum vertical distance between nodes
    const minXSpacing = 40;
    const sortedNodes = root.descendants().sort((a, b) => a.x - b.x);
    for (let i = 1; i < sortedNodes.length; i++) {
      if (sortedNodes[i].x - sortedNodes[i - 1].x < minXSpacing) {
        sortedNodes[i].x = sortedNodes[i - 1].x + minXSpacing;
      }
    }

    // Compute the maximum x so we know where the last node sits vertically.
    const maxX = d3.max(root.descendants(), d => d.x);

    // Draw dotted vertical gridlines from each tick to the top of the tree.
    g.selectAll(".x-grid")
      .data(xScale.ticks())
      .enter().append("line")
        .attr("class", "x-grid")
        .attr("x1", d => xScale(d))
        .attr("x2", d => xScale(d))
        .attr("y1", -2000)
        .attr("y2", maxX + 20)
        .style("stroke", "gray")
        .style("stroke-dasharray", "3,3")
        .style("stroke-opacity", 0.2);

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
    const nodeSelection = g.selectAll(".node")
      .data(root.descendants())
      .enter().append("g")
        .attr("class", "node")
        .attr("id", d => "node-" + d.data.id)
        .attr("transform", d => `translate(${d.y},${d.x})`)
        .style("cursor", d => d.data.wiki_link ? "pointer" : "default")
        .on("click", (event, d) => {
          showModal(d.data);
        });

    nodeSelection.append("circle")
      .attr("r", 10)
      .attr("fill", "white")
      .attr("stroke", "#333")
      .attr("stroke-width", 2);

    nodeSelection.append("text")
      .attr("dy", 4)
      .attr("x", d => d.children ? -15 : 15)
      .style("text-anchor", d => d.children ? "end" : "start")
      .text(d => d.data.name);

  })
  .catch(err => console.error("failed to load data:", err));

  // POST query to backend and highlight matched nodes by ID
  window.handleNaturalLanguageQuery = function(query) {
    if (!root) {
      alert("Tree is still loading. Please wait a moment and try again.");
      return;
    }
    fetch('/query', {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query })
    })
    .then(res => res.json())
    .then(data => {
      const nodeIds = data.node_ids || [];
      d3.selectAll('.node').classed('highlight', d => nodeIds.includes(d.data.id));
      if (nodeIds.length > 0) {
        const nodeData = root.descendants().find(d => d.data.id === nodeIds[0]);
        if (nodeData) {
          zoomToNode(nodeData);
        }
      }
    })
    .catch(err => {
      console.error('Query failed:', err);
    });
  };

  function zoomToNode(d) {
    const scale = 1.5; 
    const x = d.y;
    const y = d.x;
    svg.transition()
      .duration(750)
      .call(
        zoom.transform,
        d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(scale)
          .translate(-x, -y)
      );
  }

  function showModal(data) {
    document.getElementById('modal-title').textContent = data.name;
    document.getElementById('modal-annotation').textContent = 'Loading summary...';
    const link = document.getElementById('modal-link');
    if (data.wiki_link) {
      link.href = data.wiki_link;
      link.style.display = '';
      // Fetch summary from backend
      fetch('/wiki_summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wiki_link: data.wiki_link })
      })
      .then(res => res.json())
      .then(res => {
        document.getElementById('modal-annotation').textContent = res.summary;
      })
      .catch(() => {
        document.getElementById('modal-annotation').textContent = 'Could not load summary.';
      });
    } else {
      link.style.display = 'none';
      document.getElementById('modal-annotation').textContent = data.annotation || '';
    }
    document.getElementById('node-modal').style.display = 'flex';
  }

  window.closeModal = function() {
    document.getElementById('node-modal').style.display = 'none';
    svg.transition().duration(750).call(
      d3.zoom().transform,
      d3.zoomIdentity
    );
  };

  document.getElementById('query').disabled = false;

})();
