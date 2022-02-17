"use strict";

const mqtt=require('mqtt');
const { ServiceBroker } = require("moleculer");
const Influx = require('influx');
var client = null;
const broker = new ServiceBroker();
module.exports = {
	name: "data",
	settings: {
       /* fields:["_id","Beach Name","Measurement timestamp","Water temperature",
    "Turbidity","Transducer depth","Wave height","Wave Period","Battery life",
    "Measurement timestamp label","Measurement ID"]*/
	},
	actions: {
		/**
		 * Add a new row.
		 *
		 * @actions
		 * @param {Object} data - Data entity
		 *
		 * @returns {Object} Created entity
		 */
		postData:{
			rest: {
				method: "POST",
				path: "/Data",
			},
			params: {
				data: { type: "object" }
			},
			async handler(ctx){

                let entity = ctx.params.data;

				let info = { "entity": entity };

				this.influx.writePoints([
                    { 
                        measurement: 'SensorDataIOT',
                        fields: {
							BeachName: entity["Beach Name"],
							MeasurementTimestamp: entity["Measurement Timestamp"],
							WaterTemperature: parseFloat(entity["Water Temperature"]),
							Turbidity: parseFloat(entity["Turbidity"]),
							TransducerDepth: 0.123,
							WaveHeight: parseFloat(entity["Wave Height"]),
							WavePeriod: parseFloat(entity["Wave Period"]),
							BatteryLife: parseFloat(entity["Battery Life"]),
							MeasurementTimestampLabel: entity["Measurement Timestamp Label"],
							MeasurementID: entity["Measurement ID"]
                        },
                        time: Date.now() 
                    }
				]);

				if (client.connected==true)
				{
					client.publish("Analytics", JSON.stringify(info));
				}
				else
				{
					console.log("Data klijent nije povezan na MQTT");
				}

				return;
			}
		},

		getData:{
			rest:{
				method: "GET",
				path: "/Data"
			},set: {
				 params:{
				 	name: {type: "String"},
				 	temp: {type: "String"},
				 	wavePeriod: {type: "String"},
					bat: {type: "String"}
				 }
			},
			async handler(ctx){

				let query = "select * from SensorDataIOT where "
				if(ctx.params.name!="All"){
						query = query + "BeachName='" + ctx.params.name.toString() + "'";
				}
				else
				{
					query = query + "BeachName='Montrose Beach'"
				}
				if(ctx.params.temp!="All"){
					   query = query + " AND WaterTemperature=" + ctx.params.temp.toString();
				   }
				if(ctx.params.bat!="All"){
					   query = query + " AND BatteryLife=" + ctx.params.bat.toString();
				   }
				if(ctx.params.wavePeriod!="All"){
					query = query + " AND WavePeriod=" + ctx.params.wavePeriod.toString();
				}

				let results =[];
				await this.influx.query(query)
  				.then( result => {
					 result.forEach(r =>{
						 results.push(
							 {
								"Beach Name": r["BeachName"],
								"Measurement Timestamp": r["MeasurementTimestamp"],
								"Water Temperature": r["WaterTemperature"],
								"Transducer Depth": r["TransducerDepth"],
								"Wave Height": r["WaveHeight"],
								"Wave Period": r["WavePeriod"],
								"Battery Life": r["BatteryLife"],
								"Measurement Timestamp Label": r["MeasurementTimestampLabel"],
								"Measurement ID": r["MeasurementID"],
								"Turbidity": r["Turbidity"]
							 })
					 })
				  } )
  					.catch( error =>  console.log( error ) );
				return results;
			}
		},	
	},
	/**
	 * Events
	 */
	 events: {
	},
	/**
	 * Service created lifecycle event handler
	 */
	created() {
		client = mqtt.connect("mqtt://mqtt:1883",{clientId:"mqttjs02"});
        client.on("connect",function() { console.log("Data connected to MQTT") });

		this.influx = new Influx.InfluxDB({
			host: process.env.INFLUXDB_HOST || 'influx',
			database: process.env.INFLUXDB_DATABASE || 'SensorDataIOT',
			port: 8086,
			username: process.env.ADMIN_USER || 'admin',
			password: process.env.ADMIN_PASSWORD || 'admin',
			schema: [
				{
					measurement: 'SensorDataIOT',
					fields: {
						BeachName: Influx.FieldType.STRING,
						MeasurementTimestamp: Influx.FieldType.STRING,
						WaterTemperature: Influx.FieldType.FLOAT,
						Turbidity: Influx.FieldType.FLOAT,
						TransducerDepth: Influx.FieldType.FLOAT,
						WaveHeight: Influx.FieldType.FLOAT,
						WavePeriod: Influx.FieldType.FLOAT,
						BatteryLife: Influx.FieldType.FLOAT,
						MeasurementTimestampLabel: Influx.FieldType.STRING,
						MeasurementID: Influx.FieldType.STRING
					},
					tags: ['host'],
				}
			]
		});
		
		this.influx.getDatabaseNames().then((names) => {
			console.log(names)
			if (!names.includes('SensorDataIOT')) {
			  return this.influx.createDatabase('SensorDataIOT');
			}
			return null;
		}).catch( error => console.log(error));
	},

	/**
	 * Service started lifecycle event handler
	 */
	async started() {
	},

	/**
	 * Service stopped lifecycle event handler
	 */
	async stopped() {
		client.end();
	},
};