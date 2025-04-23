const container = document.getElementById('tree-container');
const width = container.clientWidth;
const height = container.clientHeight;

// Create SVG with zoom capability
const svg = d3.select("#tree-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .call(d3.zoom().on("zoom", function(event) {
        svg.attr("transform", event.transform);
    }))
    .append("g");

// Define tree layout (adjust layout size if needed)
const treeLayout = d3.tree().size([height, width - 160]);
const root = d3.hierarchy({
    name: "Communication Devices",
    children: [
        { name: "Telegraph", year: 1925, wiki: "https://en.wikipedia.org/wiki/Telegraph" },
        { name: "Telephone", year: 1925, wiki: "https://en.wikipedia.org/wiki/Telephone" },
        { name: "Radio", year: 1925, wiki: "https://en.wikipedia.org/wiki/Radio" },
        {
            name: "Mobile Phones",
            year: 2000,
            wiki: "https://en.wikipedia.org/wiki/Mobile_phone",
            children: [
                { name: "Smartphones", year: 2012, wiki: "https://en.wikipedia.org/wiki/Smartphone" }
            ]
        }
    ]
});
treeLayout(root);

// Draw links between nodes
svg.selectAll(".link")
    .data(root.links())
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("d", d3.linkHorizontal()
        .x(d => d.y)
        .y(d => d.x))
    .attr("fill", "none")
    .attr("stroke", "#fff")
    .attr("stroke-width", "1.5px");

// Draw nodes
const node = svg.selectAll(".node")
    .data(root.descendants())
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", d => `translate(${d.y},${d.x})`)
    .on("click", (event, d) => {
        window.open(d.data.wiki, "_blank");
    });

node.append("circle")
    .attr("r", 5)
    .attr("fill", "#fff");

node.append("text")
    .attr("dy", ".35em")
    .attr("x", d => d.children ? -13 : 13)
    .style("text-anchor", d => d.children ? "end" : "start")
    .style("fill", "#fff")
    .style("font", "12px sans-serif")
    .text(d => d.data.name);