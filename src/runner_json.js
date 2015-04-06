var strPrty = 'P1,P2,P3,P4';
var HTMLCS_RUNNER = new function() {
	this.prty='';
	
	this.run = function(standard, screenshot_url, prty) {
	    if(prty != 'undefined') strPrty = prty;

		HTMLCS.process(standard, document, function() {
			var msgs = HTMLCS.getMessages();
			var content = [];
			var heading = "";
			var type = '';
			var outerHTML = '';
			var prtyArr = strPrty.split(',');

			try {
				var principles = {
						'Principle1': 'Perceivable',
						'Principle2': 'Operable',
						'Principle3': 'Understandable',
						'Principle4': 'Robust'
					};

				if (msgs.length === 0) {
					content.push({'message':'No violations found'});
					return;
				}

				var errors   = 0;
				var warnings = 0;
				var notices  = 0;
				var count=1;

				for (var i = 0; i < msgs.length; i++) {
					var msg = msgs[i];
					var temp_obj = {};
					switch (msg.type) {
						case HTMLCS.ERROR:
						type = 'Error';
						// errors += 1;
						break;
						case HTMLCS.WARNING:
							type = 'Warning';
							warnings++;
						break;

						case HTMLCS.NOTICE:
							type = 'Notice';
							notices++;
						break;

						default:
							type = 'Unknown:' + msg.type +' ';
						break;
											
						 }

					 	if (msg.element.innerHTML && msg.element.innerHTML.length > 50) {
							var outerHTML = msg.element.outerHTML.replace(msg.element.innerHTML, msg.element.innerHTML.substr(0, 50) + '...');
						} else {
							var outerHTML = msg.element.outerHTML;
						}
						// Get the success criterion so we can provide a link.
						var msgParts   = msg.code.split('.');
						var principle  = msgParts[1];
						var sc         = msgParts[3].split('_').slice(0, 3).join('_');
						var techniques = msgParts[4];
						techniques     = techniques.split(',');
						var priority;
						
						switch(principles[principle]){
							case "Robust":
								priority = "P4";
								break;
							case "Understandable":
								priority = "P3";
								break;
							case "Operable":
								priority = "P2";
								break;
							case "Perceivable":
								priority = "P1";
								break;	

						}									

	                if(techniques.indexOf('G18')!='-1')  priority='P2';         //Issue #25 drop color contrast issue priority to P2                                                                            	                															// With current logic all Perceivable are P1 and color contrast is perceivable can't change guideline
	                // if(techniques.indexOf('H91')!='-1')  priority='P4';

					// Build a message code without the standard name.
					msgParts.shift();
					msgParts.unshift('[Standard]');
					var noStdMsgParts = msgParts.join('.');
					
					 // console.log('P R I O R I T Y -> ' + prtyArr.indexOf(priority));

					if(type !== "Warning" &&  type !== "Notice" && prtyArr.indexOf(priority) !=-1 ) {		//&& prtyArr.indexOf(priority) === 0
						errors += 1;
						temp_obj["type"] = type.toLowerCase();
						temp_obj["priority"] = priority;
						temp_obj["msg"] = msg.msg;
						temp_obj["code"] = splitLine(outerHTML.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'), 30);
						temp_obj["principle"] = '<a href="http://www.w3.org/TR/WCAG20/#' + principles[principle].toLowerCase() + '" target="_blank">' + principles[principle] + '</a>';
						var technique='';
						for (var j = 0; j < techniques.length; j++) {
							technique += '<a href="http://www.w3.org/TR/WCAG20-TECHS/' + techniques[j] + '" target="_blank">' + techniques[j] + '</a>';

						}
						temp_obj["techniques"] = technique;
						count++;
						content.push(temp_obj);						
					}
					
				} //Closing for loop

				if (errors === 0) {
					content.push({'message':'----  No Errors ---'});
					return;
				}

				var address = document.location.href;

				if(address.indexOf("file:") === -1){
					heading += '<h4>' + address +'</h4>';
					heading += '<div style="margin-left:10px">Screenshot: &nbsp;<a href="/' + screenshot_url +'"> ' + screenshot_url + '</div>';									
				}

				content.push( {'errorcount':errors} );

			} catch (e) {
				console.log('Error:', e.toString());
			}
			console.log(JSON.stringify(content));
			console.log('done');
		});
	};		
};

//Break the code snippet into multiple lines.
function splitLine(st,n) {
		var b = ''; 
		var s = st;while (s.length > n) {
			var c = s.substring(0,n);
			var d = c.lastIndexOf(' ');
			var e =c.lastIndexOf('\n');
		if (e != -1)
		d = e; 
		if (d == -1) 
		d = n;
		b += c.substring(0,d) + '\n';
		s = s.substring(d+1);
		}		
		return b+s;
}
