InboxSDK.load('1', 'sdk_pte-gmail_9e848e78a3').then(function(sdk){

	// the SDK has been loaded, now do something with it!
	sdk.Compose.registerComposeViewHandler(function(composeView){

		var send = function() {
			// Add pte to the Bcc field
			var emailTo = 'page@publishthis.email';
			var currentBcc = composeView.getBccRecipients();
			var newBcc = [];
			currentBcc.forEach(function(addr){
				newBcc.push(addr.emailAddress);
			});
			newBcc.push(emailTo);
			composeView.setBccRecipients(newBcc);
			// Now send the email
			composeView.send();
		}
		
		composeView.addButton({
			title: "Publish This Email",
			iconUrl: chrome.extension.getURL('images/pte-icon.png'),
			onClick: function(event) {
				showModal(send);
			},
		});

	});

	function showModal(modalAction) {
		var el = document.createElement('div');
		el.style.width = '400px';
		el.innerHTML = `
			<p>Your email will be Bcc'd to <a href="http://publishthis.email" target="_blank">publishthis.email</a>.</p>
			<p><em>To:</em> and <em>Cc:</em> addresses will remain.</p>
			<p>
				<label for="pte-collection" style="font-weight: bold;">Add to collection</label>
				<input style="display: block; width: 100%; margin: 5px 0;" type="text" id="pte-collection">
				<small>Optionally enter a collection name</small>
			</p>
			<p>
				<span style="font-weight: bold; display: block; margin-bottom: 5px;">Send anonymously</span>
				<input type="checkbox" id="pte-anon" style="margin-right: 5px;">
				<label for="pte-anon">Hide my identity</label>
			</p>
		`;
		var modal = sdk.Widgets.showModalView({
			el: el,
			title: 'Publish This Email',
			buttons: [
				{
					text: 'Publish',
					type: 'PRIMARY_ACTION',
					onClick: function(){
						modalAction();
						modal.close();
					}
				},
				{
					text: 'Cancel',
					onClick: function(){
						modal.close();
					}
				}
			]
		});
	}

});
