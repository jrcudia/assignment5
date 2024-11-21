import React, { Component } from "react";
import * as d3 from "d3";
import './Child1.css';

class Child1 extends Component {
  state = {
    company: "Apple", // Default Company
    selectedMonth: 'November' //Default Month
  };

  componentDidMount() {
    console.log(this.props.csv_data) // Use this data as default. When the user will upload data this props will provide you the updated data
    this.renderChart();
  }

  componentDidUpdate() {
    console.log(this.props.csv_data)
    this.renderChart();
  }

  renderChart() {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const data = this.props.csv_data;
    const company_data = data.filter(d => (d.Company === this.state.company)
      && (months[d.Date.getMonth()] === this.state.selectedMonth)
    );
    if (company_data.length === 0) { return; }
    // console.log(`${this.state.company} data:`, company_data);

    let margin = { top: 20, right: 30, bottom: 60, left: 60 },
      w = 700,
      h = 400,
      innerW = w - margin.left - margin.right,
      innerH = h - margin.top - margin.bottom;

    const container = d3.select('.svg_container')
      .attr('width', w)
      .attr('height', h)
      .select('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)

    const x_scale = d3.scaleTime().domain(d3.extent(company_data, d => d.Date)).range([10, innerW]);
    const y_min = d3.min(company_data, d => Math.min(d.Open, d.Close));
    const y_max = d3.max(company_data, d => Math.max(d.Open, d.Close));
    const y_scale = d3.scaleLinear().domain([y_min, y_max]).range([innerH, 0]);
    console.log('open, close', company_data[0].Open, company_data[0].Close);

    let lineGenOpen = d3.line()
      .curve(d3.curveCardinal)
      .x(d => x_scale(d.Date))
      .y(d => y_scale(d.Open));

    let lineGenClose = d3.line()
      .curve(d3.curveCardinal)
      .x(d => x_scale(d.Date))
      .y(d => y_scale(d.Close));

    let openPathData = lineGenOpen(company_data);
    let closePathData = lineGenClose(company_data);

    const open_color = "#b2df8a";
    const close_color = "#e41a1c";

    container.selectAll('.open_line').data([openPathData]).join('path')
      .attr('class', 'open_line')
      .attr('d', d => d)
      .attr('fill', 'none')
      .attr('stroke', open_color)
      .attr('stroke-width', 3)

    container.selectAll('.close_line').data([closePathData]).join('path')
      .attr('class', 'close_line')
      .attr('d', d => d)
      .attr('fill', 'none')
      .attr('stroke', close_color)
      .attr('stroke-width', 3);

    container.selectAll('.x_axis').data([null]).join('g')
      .attr('class', 'x_axis')
      .attr('transform', `translate(0, ${innerH + 10})`)
      .call(d3.axisBottom(x_scale).tickFormat(d3.timeFormat('%a %d')))
      .selectAll('text')
      .attr('transform', `rotate(45)`)
      .attr('dx', 25)
      .attr('dy', 4)
      .attr('font-size', 12);

    container.selectAll('.y_axis').data([null]).join('g')
      .attr('class', 'y_axis')
      .call(d3.axisLeft(y_scale))
      .selectAll('text')
      .attr('font-size', 12);

    let div = d3.select('body').selectAll('.tooltip').data([null]).join('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute');


    container.selectAll('.open_circle').data(company_data).join('circle')
      .attr('class', 'open_circle')
      .attr('cx', d => x_scale(d.Date))
      .attr('cy', d => y_scale(d.Open))
      .attr('r', 4)
      .attr('fill', open_color)
      .on('mouseover', (event, d) => {
        div.transition().duration(300).style('opacity', 0.8).style('display', 'block')
        div.html(`Date: ${d.Date.toLocaleDateString('en-US')}<br>
          Open: ${d.Open.toFixed(2)}<br>
          Close: ${d.Close.toFixed(2)}<br>
          Difference: ${(d.Close - d.Open).toFixed(2)}
        `)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY}px`)
          .style('border', 'solid black')
          .style('background-color', 'black')
          .style('color', 'white')
          .style('padding', '5px')
          .style('border-radius', '10px')
      })
      .on('mouseout', () => {
        div.transition().duration(300)
          .style('opacity', 0)
          .on('end', () => div.style('display', 'none'));
      });

    container.selectAll('.close_circle').data(company_data).join('circle')
      .attr('class', 'close_circle')
      .attr('cx', d => x_scale(d.Date))
      .attr('cy', d => y_scale(d.Close))
      .attr('r', 4)
      .attr('fill', close_color)
      .on('mouseover', (event, d) => {
        div.transition().duration(300).style('opacity', 0.8).style('display', 'block')
        div.html(`Date: ${d.Date.toLocaleDateString('en-US')}<br>
          Open: ${d.Open.toFixed(2)}<br>
          Close: ${d.Close.toFixed(2)}<br>
          Difference: ${(d.Close - d.Open).toFixed(2)}
        `)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY}px`)
          .style('border', 'solid black')
          .style('background-color', 'black')
          .style('color', 'white')
          .style('padding', '5px')
          .style('border-radius', '10px')
      })
      .on('mouseout', () => {
        div.transition().duration(300)
          .style('opacity', 0)
          .style('display', 'none')
      });

      const legend = d3.select('.legend').attr('width', 100).attr('height', 100)
      legend.selectAll('.rect_open').data([null]).join('rect')
        .attr('class', 'rect_open')
        .attr('width', 30)
        .attr('height', 30)
        .attr('fill', open_color)
      
      legend.selectAll('.rect_close').data([null]).join('rect')
        .attr('class', 'rect_close')
        .attr('y', 40)
        .attr('width', 30)
        .attr('height', 30)
        .attr('fill', close_color)
      
      legend.selectAll('.open_text').data([null]).join('text')
        .attr('class', 'open_text')
        .attr('x', 40)
        .attr('y', 20)
        .text('Open')
      
      legend.selectAll('.close_text').data([null]).join('text')
        .attr('class', 'close_text')
        .attr('x', 40)
        .attr('y', 60)
        .text('Close')

  }

  handleRadio = (e) => {
    this.setState({ company: e.target.value })
  }

  handleDropdown = (e) => {
    this.setState({ selectedMonth: e.target.value })
  }

  render() {
    console.log(this.state.selectedMonth)
    const options = ['Apple', 'Microsoft', 'Amazon', 'Google', 'Meta']; // Use this data to create radio button
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']; // Use this data to create dropdown

    return (
      <div className="child1">
        <div className="container">
          <div className="radio-buttons">
            <p>Company:</p>
            {
              options.map(company => (
                <label key={company}>
                  <input
                    type="radio"
                    name="company"
                    value={company}
                    checked={this.state.company === company}
                    onChange={this.handleRadio} />
                  {company}
                </label>
              ))
            }
          </div>
          <div className="dropdown-month">
            <label>Month:</label>
            <select value={this.state.selectedMonth} name="months" onChange={this.handleDropdown}>
              {
                months.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))
              }
            </select>
          </div>
          <div className="svg-div">
            <svg className="svg_container"><g></g></svg>
            <svg className="legend"></svg>
          </div>
        </div>
      </div>
    );
  }
}

export default Child1;
