
import React, {Fragment,Component} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  DeviceEventEmitter,
  StatusBar,
} from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';
import init from "react_native_mqtt";

import {
  TabView,
  Text,
  Tab,
  List,
  ListItem
} from 'react-native-ui-kitten';

import {
  VictoryChart,
  VictoryLine,
} from 'victory-native';

init({
  size: 10000,
  storageBackend: AsyncStorage,
  defaultExpires: 1000 * 3600 * 24,
  enableCache: true,
  reconnect: true,
  sync: {}
});

var client = null;
var cur_topic ="test"
function onConnect() {
  cur_topic = `t/+`;
  client.subscribe(cur_topic);
}

function onConnectionLost(responseObject) {
  //Alert.alert("Connection Lost" ,responseObject.errorMessage);
}

function onMessageArrived(message) {
  let topic = message.destinationName;
  DeviceEventEmitter.emit("mqtt_event", { topic, json:message.payloadString });
}
const ll=[
  {time:'2019-01-12 10:30',desc:''},
  {time:'2019-01-13 10:30',desc:''},
]

export default class Home extends  Component {
  static navigationOptions = {
    title: '电梯实时数据',
  };

  state = {
    selectedIndex: 0,
    json:'{}',
    topic:'topic',
    alerts:ll,
    realdata:[
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
      { x: 4, y: 0 },
      { x: 5, y: 0 },
      { x: 5, y: 0 },
      { x: 6, y: 0 },
      { x: 7, y: 0 },
    ]
  };

  onSelect = (selectedIndex) => {
    this.setState({ selectedIndex });
  };


  componentDidMount() {
    let that = this;
    client = new Paho.MQTT.Client("iot.eclipse.org", 443, "hbzb_" + Date.now());
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;
    client.connect({
      onSuccess: onConnect,
      useSSL: true,
      onFailure: e=>alert(JSON.stringify(e))
    });
    this.service = DeviceEventEmitter.addListener(
      "mqtt_event",
      async ({ topic, json }) => {
        if(topic.indexOf('alert')>0){
          let ccc = JSON.parse(json)
          let tt = [{time:ccc.time, desc:ccc.desc}, ...that.state.alerts]
          that.setState({ alerts:tt });
        }else{
          let ccc = JSON.parse(json)
          let c1 = ccc.c1
          let time = ccc.time
          let tt = [...that.state.realdata, {x:time.substr(14,5), y:c1}]
          that.setState({ json: ccc, topic, realdata:tt.slice(1,8) });
        }
      }
    );
  }
  componentWillUnmount() {
    client.disconnect();
    client = null;
    this.service.remove();
    this.service = null;
  }


  render() {
    let aa = this.state.json
    return (
      <TabView
        selectedIndex={this.state.selectedIndex}
        onSelect={this.onSelect}>
        <Tab title='实时数据'>
          <Fragment>
            <View style={{padding:5, borderWidth: .8, borderColor:'#BBBBBB', margin:5}}>
              <Text category='h6'>时间: <Text status='primary'>{aa.time && aa.time.substr(0,19)}</Text></Text>
              <Text category='h6'>楼层: <Text  status='success'>{aa.c1}</Text> </Text>
              <Text category='h6'>速度: <Text  status='success'>{aa.c2}</Text> </Text>
              <Text category='h6'>加速度: <Text status='success'>{aa.c3}</Text> </Text>
              <Text category='h6'>温度: <Text status='success'>{aa.c4}</Text> </Text>
              <Text category='h6'>湿度: <Text status='success'>{aa.c5}</Text> </Text>
              <Text category='h6'>气压: <Text status='success'>{aa.c6}</Text> </Text>
            </View>
            <Text  category='h6' style={{paddingLeft:20}}>加速度历史数据</Text>
            <VictoryChart>
              <VictoryLine
                style={{
                  data: { stroke: "#c43a31" },
                  parent: { border: "1px solid #ccc"}
                }}
                data={this.state.realdata}
              />
            </VictoryChart>
          </Fragment>
        </Tab>
        <Tab title='报警'>
          <List 
              data={this.state.alerts} 
              renderItem={ ({item})=><ListItem
                title={item.time}
                description={item.desc}
              /> }
          />
        </Tab>
      </TabView>
    );
  }
}

