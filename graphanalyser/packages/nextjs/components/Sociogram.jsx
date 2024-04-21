import { useEffect, useRef } from "react";
import * as d3 from "d3";

const Sociogram = ({ data }) => {
  const graphRef = useRef();

  useEffect(() => {
    if (!data) return;

    var margin = { top: 10, right: 30, bottom: 30, left: 40 },
      width = 400 - margin.left - margin.right,
      height = 605 - margin.top - margin.bottom;

    const svg = d3.select(graphRef.current).append("svg").attr("width", width).attr("height", height);

    // Define your network graph rendering using D3.js
    // Example: rendering nodes and links

    var link = svg.selectAll("line").data(data.links).enter().append("line").style("stroke", "#aaa");

    // Initialize the nodes
    var node = svg.selectAll("circle").data(data.nodes).enter().append("circle").attr("r", 5).style("fill", "#69b3a2");

    var label = svg
      .selectAll("text")
      .data(data.nodes)
      .enter()
      .append("text")
      .text(d => d.id)
      .attr("dx", 15)
      .attr("dy", 4);

    // Let's list the force we wanna apply on the network
    var simulation = d3
      .forceSimulation(data.nodes) // Force algorithm is applied to data.nodes
      .force(
        "link",
        d3
          .forceLink() // This force provides links between nodes
          .id(function (d) {
            return d.id;
          }) // This provide  the id of a node
          .links(data.links), // and this the list of links
      )
      .force("charge", d3.forceManyBody().strength(-1600)) // This adds repulsion between nodes. Play with the -400 for the repulsion strength
      .force("center", d3.forceCenter(width/2, height/2)) // This force attracts nodes to the center of the svg area
      .on("end", ticked);

    function ticked() {
      link
        .attr("x1", function (d) {
          return d.source.x;
        })
        .attr("y1", function (d) {
          return d.source.y;
        })
        .attr("x2", function (d) {
          return d.target.x;
        })
        .attr("y2", function (d) {
          return d.target.y;
        });

      node
        .attr("cx", function (d) {
          return d.x;
        })
        .attr("cy", function (d) {
          return d.y;
        });
      label.attr("x", d => d.x).attr("y", d => d.y);
    }
    simulation.force("link").links(data.links);

    // Cleanup function to remove svg on unmount
    return () => {
      svg.remove();
    };
  }, [data]);

  return <div ref={graphRef} />;
};

export default Sociogram;

// Usage:
// <FollowerGraph data={exampleData} />
