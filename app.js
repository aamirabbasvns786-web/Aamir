const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const toastEl = $('#toast');
let toastTimer;
function toast(message){toastEl.textContent=message;toastEl.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toastEl.classList.remove('show'),2600)}
function go(page){const target=$(`#page-${page}`);if(!target){toast('This section is coming soon.');return}$$('.page').forEach(p=>p.classList.toggle('active',p===target));$$('[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===page));window.scrollTo({top:0,behavior:'smooth'});if(page==='camera'){}}
$$('[data-page]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.page)));
$$('[data-go]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.go)));
const modalBackdrop=$('#modalBackdrop'), modalContent=$('#modalContent');
function modal(html){modalContent.innerHTML=html;modalBackdrop.classList.add('open')}
function closeModal(){modalBackdrop.classList.remove('open')}
$('#modalClose').addEventListener('click',closeModal);
modalBackdrop.addEventListener('click',e=>{if(e.target===modalBackdrop)closeModal()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
let profile={name:'Your profile',username:'yourname',photo:null};
try{profile={...profile,...JSON.parse(localStorage.getItem('camraProfile')||'{}')}}catch{}
function renderProfile(){const name=profile.name||'Your profile',handle='@'+(profile.username||'yourname');['railName','topName','profileName','settingsName','settingNameValue'].forEach(id=>{const el=$('#'+id);if(el)el.textContent=name});['railHandle','profileTag','settingsTag','settingHandleValue'].forEach(id=>{const el=$('#'+id);if(el)el.textContent=handle});$$('.avatar').filter(a=>a.textContent==='S'||a.textContent==='Y').forEach(a=>a.textContent=(name[0]||'Y').toUpperCase())}
function saveProfile(){localStorage.setItem('camraProfile',JSON.stringify(profile));renderProfile()}
renderProfile();
$('#profileOpen').addEventListener('click',()=>go('settings'));
$('#notifications').addEventListener('click',()=>toast('You’re all caught up!'));
$('#globalSearch').addEventListener('keydown',e=>{if(e.key==='Enter'){toast('Search is a UI preview. Connect the API to search live users and posts.')}});

// Sign-up/profile editing modal
function profileModal(){modal(`<p class="eyebrow">YOUR CAMRA ID</p><h2>Make it yours.</h2><p>Set the name and username people will see across AI Camra.</p><label for="editDisplayName">Display name</label><input id="editDisplayName" maxlength="40" value="${escapeHtml(profile.name==='Your profile'?'':profile.name)}" placeholder="Your full name"><label for="editHandle">Username</label><input id="editHandle" maxlength="24" value="${escapeHtml(profile.username==='yourname'?'':profile.username)}" placeholder="your_unique_name"><button class="primary" id="saveProfileBtn">Save profile</button>`);$('#saveProfileBtn').addEventListener('click',()=>{const name=$('#editDisplayName').value.trim(),username=$('#editHandle').value.trim().replace(/^@/,'').replace(/[^a-zA-Z0-9_.]/g,'');if(!name||!username){toast('Enter both a display name and username.');return}profile.name=name;profile.username=username;saveProfile();closeModal();toast('Profile saved on this device.')})}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
$('#editProfile').addEventListener('click',profileModal);$('#editName').addEventListener('click',profileModal);$('#editUsername').addEventListener('click',profileModal);
$('#logout').addEventListener('click',()=>modal('<p class="eyebrow">SIGN OUT</p><h2>Ready to leave?</h2><p>This demo does not have a real account session. Your local profile will remain saved on this device.</p><button class="primary" id="confirmLogout">Got it</button>'));
document.addEventListener('click',e=>{if(e.target.id==='confirmLogout')closeModal()});
$('#privacyInfo').addEventListener('click',()=>modal('<p class="eyebrow">PRIVACY & DATA</p><h2>Your data, your choice.</h2><p>This starter stores only the profile fields you edit in your browser’s localStorage. It does not upload your name, photos, messages, or location to a server. Camera access happens only after you press Enable camera.</p><p>Before production, add a privacy policy, consent controls, secure authentication, server-side access rules, and a clear account deletion flow.</p><button class="primary" id="privacyOkay">Understood</button>'));
document.addEventListener('click',e=>{if(e.target.id==='privacyOkay')closeModal()});
let locationEnabled=false,notificationsEnabled=true;
$('#locationToggle').addEventListener('click',()=>{if(!locationEnabled){if(!navigator.geolocation){toast('Location is not supported in this browser.');return}navigator.geolocation.getCurrentPosition(pos=>{locationEnabled=true;$('#locationStatus').textContent='Enabled';toast(`Location permission granted (${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}). Not uploaded.`)},()=>toast('Location permission was not granted.'),{enableHighAccuracy:false,timeout:8000})}else{locationEnabled=false;$('#locationStatus').textContent='Off';toast('Location sharing turned off.') }});
$('#notificationsToggle').addEventListener('click',()=>{notificationsEnabled=!notificationsEnabled;$('#notificationStatus').textContent=notificationsEnabled?'On':'Off';toast(`Notifications preference: ${notificationsEnabled?'On':'Off'}`)});
$('#themeToggle').addEventListener('click',()=>toast('Dark mode is the current AI Camra look.'));

// Camera: user-initiated browser permission only
const video=$('#cameraVideo'), placeholder=$('#cameraPlaceholder'), cameraFrame=$('.camera-frame'), canvas=$('#captureCanvas');
let stream=null, currentFilter='none', demoMode=false, facing='user';
async function startCamera(){if(!navigator.mediaDevices?.getUserMedia){toast('Camera access needs a supported browser and HTTPS or localhost.');return}try{if(stream)stream.getTracks().forEach(t=>t.stop());stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:facing},audio:false});video.srcObject=stream;cameraFrame.classList.add('video-on');placeholder.style.display='none';demoMode=false;applyFilter(currentFilter);toast('Camera ready. Your preview stays on this device until you capture/share.')}catch(err){toast(err.name==='NotAllowedError'?'Camera permission was denied. You can enable it in browser settings.':'Could not open camera. Try HTTPS or localhost.')}} 
$('#startCamera').addEventListener('click',startCamera);
$('#demoCamera').addEventListener('click',()=>{demoMode=true;placeholder.style.display='none';cameraFrame.classList.add('demo-on');cameraFrame.style.background='radial-gradient(circle at 55% 35%,#ffc7dd 0 8%,transparent 26%),radial-gradient(ellipse at 30% 70%,#a34dff 0,transparent 35%),linear-gradient(145deg,#1d1740,#a35a9c 50%,#171027)';toast('Demo preview enabled. Start camera for your real live preview.')});
function applyFilter(filter){currentFilter=filter;video.style.filter=({'none':'none','beauty':'brightness(1.08) saturate(1.12)','vintage':'sepia(.45) contrast(.92) saturate(.8)','mono':'grayscale(1)','dreamy':'brightness(1.12) saturate(1.08) blur(.35px)','neon':'saturate(1.8) contrast(1.12) hue-rotate(12deg)','sunset':'sepia(.25) saturate(1.45) hue-rotate(-8deg)','cool':'saturate(.9) hue-rotate(13deg) brightness(1.04)'})[filter]||'none';$$('.filter-option').forEach(b=>b.classList.toggle('selected',b.dataset.filter===filter));}
$$('.filter-option').forEach(b=>b.addEventListener('click',()=>{applyFilter(b.dataset.filter);toast(`${b.querySelector('b').textContent} filter selected.`)}));
$('#flipCamera').addEventListener('click',()=>{facing=facing==='user'?'environment':'user';if(stream)startCamera();else toast('Enable the camera first to switch cameras.')});
$('#closeCamera').addEventListener('click',()=>{if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;video.srcObject=null;cameraFrame.classList.remove('video-on');placeholder.style.display='block';toast('Camera paused.')}else toast('Camera is not running.')});
$('#capturePhoto').addEventListener('click',()=>{if(!stream||video.readyState<2){toast('Enable the camera to capture a photo.');return}canvas.width=video.videoWidth;canvas.height=video.videoHeight;const ctx=canvas.getContext('2d');ctx.filter=getComputedStyle(video).filter;ctx.drawImage(video,0,0,canvas.width,canvas.height);const link=document.createElement('a');link.download='ai-camra-snap.jpg';link.href=canvas.toDataURL('image/jpeg',.92);link.click();toast('Snap saved to your device. It was not uploaded.')});
$('#uploadPhoto').addEventListener('click',()=>{const input=document.createElement('input');input.type='file';input.accept='image/*';input.onchange=()=>{if(input.files[0]){const url=URL.createObjectURL(input.files[0]);placeholder.style.display='none';video.style.display='none';cameraFrame.style.backgroundImage=`url("${url}")`;cameraFrame.style.backgroundSize='cover';cameraFrame.style.backgroundPosition='center';toast('Gallery image preview loaded locally.')}};input.click()});
$('#timerButton').addEventListener('click',()=>toast('Timer control is a prototype interaction.'));

// Feed interactions
$$('.like').forEach(b=>b.addEventListener('click',()=>{const liked=b.dataset.liked==='yes';b.dataset.liked=liked?'no':'yes';b.firstChild.textContent=liked?'♡ ':'♥ ';toast(liked?'Like removed.':'You liked this post.')}));
$$('.save').forEach(b=>b.addEventListener('click',()=>{b.textContent=b.textContent==='♧'?'✓':'♧';toast(b.textContent==='✓'?'Post saved locally.':'Post removed from saved.')}));
$$('.follow').forEach(b=>b.addEventListener('click',()=>{const follow=b.textContent==='Follow';b.textContent=follow?'Following':'Follow';toast(follow?'Following in this demo.':'Unfollowed in this demo.')}));

// Messages demo
$('#messageForm').addEventListener('submit',e=>{e.preventDefault();const input=$('#messageInput'),value=input.value.trim();if(!value)return;const bubble=document.createElement('div');bubble.className='bubble sent';bubble.textContent=value;const time=document.createElement('small');time.textContent='Just now';bubble.appendChild(time);$('#messages').appendChild(bubble);input.value='';$('#messages').scrollTop=$('#messages').scrollHeight;toast('Demo message added locally. Connect the messaging API for real delivery.')});
$('#newMessage').addEventListener('click',()=>modal('<p class="eyebrow">NEW CONVERSATION</p><h2>Start a chat.</h2><p>Search for a Camra username to start a conversation.</p><label>Username</label><input id="newChatName" placeholder="@username"><button class="primary" id="startChat">Start conversation</button>'));
document.addEventListener('click',e=>{if(e.target.id==='startChat'){const v=$('#newChatName').value.trim();closeModal();toast(v?`Chat with ${v} is a demo preview.`:'Enter a username to continue.')}});
$$('.chat-person').forEach(b=>b.addEventListener('click',()=>{ $$('.chat-person').forEach(p=>p.classList.toggle('active',p===b));const name=$('b',b)?.textContent||'Friend';$('.conversation-head b').textContent=name;toast(`Opened ${name} conversation preview.`)}));

// Shopping demo
let cart=0;$$('.add-cart').forEach(b=>b.addEventListener('click',()=>{cart++;$('#cartCount').textContent=cart;b.textContent='✓ Added';toast('Added to demo cart. Checkout is not connected.')}));$('#cartButton').addEventListener('click',()=>toast(`Your demo cart has ${cart} item${cart===1?'':'s'}. Checkout is not connected.`));
$$('.category').forEach(b=>b.addEventListener('click',()=>{$$('.category').forEach(x=>x.classList.toggle('active',x===b));toast(`${b.textContent} category selected.`)}));

// AI tools are intentionally honest placeholders until a model/API is configured
$$('.tool-card').forEach(b=>b.addEventListener('click',()=>modal(`<p class="eyebrow">AI STUDIO · PREVIEW</p><h2>${escapeHtml(b.dataset.tool)}</h2><p>This tool is included in the UI prototype. To make it process images for real, connect an AI model/API and add a secure backend endpoint. No image has been uploaded.</p><button class="primary" id="aiOkay">Got it</button>`)));
document.addEventListener('click',e=>{if(e.target.id==='aiOkay')closeModal()});
