var styles = {border:"solid blue 1pt"};

var ReactNumber = React.createClass({
  getInitialState : function() {
    return {numbers: [], number: "00008001"};
  },

  //alert(JSON.parse(no)[0]['消费时间']);
  componentDidMount() {
    $.ajax({
      url : "buscard/" + this.state.number,
      type : "get",
      success : function(no){
        this.setState({
          numbers: JSON.parse(no)
        });
      }.bind(this)
    });
  },
   
  handleChange: function(event) {
    console.log(event.target);
    this.setState({number: event.target.value}, () => {if(this.state.number.length == 8) 
      $.ajax({
        url : "buscard/" + this.state.number,
        type : "get",
        success : function(no){
          this.setState({
            numbers: JSON.parse(no)
          });
        }.bind(this)
      });
    });
  },

  render: function() {
    var time = this.state.numbers.map(function(number) {
      return (<tr>
        <td style={styles}>
          {number['卡号']}
        </td>
        <td style={styles}>
          {number['消费时间']}
        </td>
        <td style={styles}>
          {number['线路']}
        </td>
        <td style={styles}>
          {number['车号']}
        </td>
        <td style={styles}>
          {number['消费次数']}
        </td>
        <td style={styles}>
          {number['剩余次数']}
        </td>
        <td style={styles}>
          {number['电子钱包']}
        </td>
      </tr>
      );
    })
    return <div><input type="text" value={this.state.number} onChange={this.handleChange}/>
    <a>
      <tr>
        <td style={styles}>
          卡号
        </td>
        <td style={styles}>
          消费时间
        </td>
        <td style={styles}>
          线路
        </td>
        <td style={styles}>
          车号
        </td>
        <td style={styles}>
          消费次数
        </td>
        <td style={styles}>
          剩余次数
        </td>
        <td style={styles}>
          电子钱包
        </td>
      </tr>
      {time}</a>
      </div>;
  }
});

var Buscard = React.createClass({
  render: function() {
    return (
      <div>
      <ReactNumber/>
      </div>
    )
  }
});

ReactDOM.render(
  <Buscard/>,
  document.getElementById("root")
);