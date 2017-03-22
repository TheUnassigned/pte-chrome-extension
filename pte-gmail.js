InboxSDK.load('1', 'sdk_pte-gmail_9e848e78a3').then(function(sdk){

	// the SDK has been loaded, now do something with it!
	sdk.Compose.registerComposeViewHandler(composeView => {

		// Global state
		const state = {
			type: 'page',
			collection: '',
			anon: false
		};

		// Update state from HTML
		const updateStateFromHTML = () => {
			state.type = $('#pte-modal-html [name="type"]:checked').val();
			state.collection = $('#pte-modal-html #pte-collection').val();
			state.anon = false;
		}

		// Generates HTML for the modal based on state
		const getModalHTML = () => {
			let html = '';

			// Logo
			html += `<div class="pte-modal-logo"><img src="${chrome.extension.getURL('images/pte-logo.png')}" alt="publishthis.email">`;

			// Type
			html += `
				<div class="pte-form-row">
					<span style="font-weight: bold; display: block; margin-bottom: 5px;">I want to</span>
					<input type="radio" value="page" name="type" id="type-page" ${state.type === 'page' ? 'checked' : ''}>
					<label class="pte-radio-label" for="type-page">Create a page</label>
					<input type="radio" value="email" name="type" id="type-email" ${state.type === 'email' ? 'checked' : ''}>
					<label class="pte-radio-label" for="type-email">Share this email</label>
				</div>
			`;

			// Type description
			if(state.type === 'page') {
				html += `
					<div class="pte-form-row" id="page-description">
						<p>A page will be created from your email's content. Email details (<em>date</em>, <em>to:</em>, <em>from:</em> etc) will not be visible.</p>
						<p>Don't forget to remove your signature before publishing!</p>
					</div>
				`;
			} else if(state.type === 'email') {
				html += `
					<div class="pte-form-row" id="email-description">
						<p>Your email will be Bcc'd to <a href="http://publishthis.email" target="_blank">publishthis.email</a>.</p>
						<p><em>To:</em> and <em>Cc:</em> addresses will remain, and will be visible when published.</p>
					</div>
				`;
			}

			// Collection
			html += `
				<div class="pte-form-row">
					<label for="pte-collection" style="font-weight: bold;">Add to collection</label>
					<input style="display: block; width: 100%; margin: 5px 0;" type="text" id="pte-collection" placeholder="E.g. blog" value="${state.collection}">
					<small>Optionally enter a collection name.</small>
				</div>
			`;

			// Anonymous
			if(false) {
				html += `
					<div class="pte-form-row">
						<span style="font-weight: bold; display: block; margin-bottom: 5px;">Send anonymously</span>
						<input type="checkbox" id="pte-anon" style="margin-right: 5px;">
						<label for="pte-anon">Hide my identity</label>
					</div>
				`;
			}

			return html;

		};

		// Handles send action based on state
		const setEmailRecipients = (send) => {
			// Build email address
			let emailTo = state.type;
			emailTo += state.collection === '' ? '' : '+' + state.collection;
			emailTo += '@publishthis.email';
			// To or Bcc?
			if(state.type === 'page') {
				composeView.setToRecipients([emailTo]);
			} else if(state.type === 'email') {
				const currentBcc = composeView.getBccRecipients();
				let newBcc = [];
				currentBcc.forEach(function(addr){
					newBcc.push(addr.emailAddress);
				});
				newBcc.push(emailTo);
				composeView.setBccRecipients(newBcc);
			}
			// Now send the email
			if(send) {
				composeView.send();
			}
		}

		// Creates modal and puts html in it
		const showModal = modalAction => {
			const el = $(`<div id="pte-modal-html">${getModalHTML()}</div>`)[0];
			//el.innerHTML = getModalHTML();
			const modal = sdk.Widgets.showModalView({
				el: el,
				title: '',
				buttons: [
					{
						text: 'Publish now',
						type: 'PRIMARY_ACTION',
						onClick: () => {
							updateStateFromHTML();
							modalAction(true);
							modal.close();
						}
					},
					{
						text: 'Just set recipient',
						onClick: () => {
							updateStateFromHTML();
							modalAction(false);
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
		
		// Add the button to the toolbar
		composeView.addButton({
			title: "Publish This Email",
			iconUrl: chrome.extension.getURL('images/pte-icon.png'),
			onClick: event => {
				showModal(setEmailRecipients);
			},
		});

		// Watch for changes to form and update state and html
		$('body').on('change', '#pte-modal-html input, #pte-modal-html select', () => {
			updateStateFromHTML();
			//console.log(getModalHTML());
			$('#pte-modal-html').html( getModalHTML() );
		});

	});

});
