import React from 'https://esm.sh/react@18.2.0';
import ReactDOM from 'https://esm.sh/react-dom@18.2.0/client';

const { useState, useEffect } = React;

function App(){
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(()=>{ fetch('/api/settings').then(r=>r.json()).then(setSettings); },[]);

  if (!settings) return React.createElement('div',null,'Loading...');

  function update(changes){
    const next = {...settings,...changes};
    setSettings(next);
  }

  async function save(){
    setSaving(true);
    await fetch('/api/settings',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(settings)});
    setSaving(false);
  }

  async function emitTest(){
    const q = new URLSearchParams({name: settings.messageOverride || 'Test Donor', amount: '5', currency: 'USD', message: 'Test from dashboard'});
    await fetch('/test-donation?'+q.toString());
  }

  return React.createElement('div',{className:'container'},
    React.createElement('h1',null,'CZStreamerAlert Dashboard'),
    React.createElement('div',{className:'card'},
      React.createElement('div',{className:'row'},
        React.createElement('div',{className:'label'},'Message override'),
        React.createElement('input',{className:'input',value:settings.messageOverride,onChange:e=>update({messageOverride:e.target.value}),placeholder:'Optional message to display'})
      ),
      React.createElement('div',{className:'row',style:{marginTop:12}},
        React.createElement('div',{className:'label'},'Sound URL'),
        React.createElement('input',{className:'input',value:settings.soundUrl,onChange:e=>update({soundUrl:e.target.value}),placeholder:'/alert.mp3 or https://...'})
      ),
      React.createElement('div',{className:'row',style:{marginTop:12}},
        React.createElement('div',{className:'label'},'Cooldown (seconds)'),
        React.createElement('input',{className:'input',type:'number',value:settings.cooldownSeconds,onChange:e=>update({cooldownSeconds:parseFloat(e.target.value||0)}),min:0})
      ),
      React.createElement('div',{className:'row',style:{marginTop:12}},
        React.createElement('div',{className:'label'},'Special effect threshold (USD)'),
        React.createElement('input',{className:'input',type:'number',value:settings.specialEffectThresholdUSD,onChange:e=>update({specialEffectThresholdUSD:parseFloat(e.target.value||0)}),min:0})
      ),
      React.createElement('div',{className:'row',style:{marginTop:12}},
        React.createElement('div',{className:'label'},'Overlay enabled'),
        React.createElement('input',{type:'checkbox',checked:settings.enabled,onChange:e=>update({enabled:e.target.checked})})
      ),
      React.createElement('div',{style:{marginTop:14,display:'flex',gap:8}},
        React.createElement('button',{className:'button',onClick:save,disabled:saving}, saving? 'Saving...':'Save Settings'),
        React.createElement('button',{className:'button small',onClick:emitTest}, 'Emit Test Alert')
      ),
      React.createElement('div',{className:'footer'},'Settings are stored in-memory on the server. Refreshing the server will reset them.')
    )
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
