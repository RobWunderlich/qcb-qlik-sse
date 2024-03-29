const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const enigma = require('enigma.js');
const schema = require('enigma.js/schemas/12.170.2.json');



let _session=null;
var getSession = function (commonHeader) {
	const traceSocket = false; /* 12.03.2022 was true; reduce logging as now everything seems to work */
 	let isDesktop = commonHeader.userId == 'Personal\\Me' 
	const certPath = 'C:\\ProgramData\\Qlik\\Sense\\Repository\\Exported Certificates\\.Local Certificates'
	const readCert = filename => fs.readFileSync(path.resolve(__dirname, certPath, filename));

	const config = {
		schema,
			url: isDesktop ? 'ws://localhost:9076/app/engineData' : 'wss://localhost:4747/app/engineData' +'/identity/'+commonHeader.appId, /*24.01.2022 added so we have different sessions for different apps */
			suspendOnClose: true, 
	}

	if (isDesktop) {
		config.createSocket = url => new WebSocket(url);	
	} else {
		let valueObj = {}
    	commonHeader.userId.split('; ').forEach(element => {
      		let arr = element.split('=')
      		valueObj[arr[0]] = arr[1]
    	})
		config.createSocket = url => new WebSocket(url, {
			ca: [readCert('root.pem')],
			key: readCert('client_key.pem'),
			cert: readCert('client.pem'),
			headers: {
				'X-Qlik-User': `UserDirectory=${encodeURIComponent(valueObj.UserDirectory)}; UserId=${encodeURIComponent(valueObj.UserId)}`,
			},	
		})
		process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";  // Required for nodejs 10		
	}
	
	let _session = enigma.create(config);
	if(traceSocket) {
		// bind traffic events to log what is sent and received on the socket:
		_session.on('traffic:sent', data => console.log(new Date(Date.now()).toUTCString()+' sent AppID '+  commonHeader.appId+'/'+  ' ' + ':' , data));
		_session.on('traffic:received', data => console.log(new Date(Date.now()).toUTCString()+' received AppID '+  commonHeader.appId+'/'+ ' '+ ':' , data));
    }
    _session.on('closed', x => _session = null);
	_session.on('closed',  y =>  console.log(new Date(Date.now()).toUTCString()+' Session Closed Event was fired '+  commonHeader.appId+'/'+  ' ' ) );
    
	return _session;
};

const closeSession = async function (session) {
	
	if (session && session.close) {
		console.log(new Date(Date.now()).toUTCString()+ ' before close session' + session.config.url +'/' + ' ' );
		await session.close()
		//await session.close().then(() => console.log('Session was properly closed'));
		return null
	} else {
			console.log(new Date(Date.now()).toUTCString()+' before close session - else' + session.config.url+'/'+ ' ' );
		return session
	}
	
}

module.exports = {
	getSession,
	closeSession,
  };
