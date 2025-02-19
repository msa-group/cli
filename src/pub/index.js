import Engine from "msa-engine";

window.onload = () => {
  init();
}

function init() {
  const $jsonViewer = document.getElementById('json-viewer');

  const $panelTitle = document.querySelectorAll('.panel-title');

  const $generateBtn = document.getElementById('generate-btn');

  const $errorDialog = document.getElementById('error-dialog');
  const $errorDialogContent = document.getElementById('error-dialog-content');
  const $errorDialogClose = document.getElementById('error-dialog-close');

  const yamlViewer = window.CodeMirror.fromTextArea(document.getElementById('yaml-viewer'), {
    mode: 'yaml',
    readOnly: true,
    theme: 'dracula',
    lineNumbers: true,
  });

  const yamlEditor = window.CodeMirror.fromTextArea(document.getElementById('yaml-viewer-editor'), {
    mode: 'yaml',
    theme: 'dracula',
    lineNumbers: true,
  });

  function generate(text, globalParams, scenceConfig) {
    const engine = new Engine();
    engine.parse(text, { Global: globalParams, Parameters: scenceConfig.Parameters })
      .then((parseEngine) => {
        yamlViewer.setValue(parseEngine.create());
        const routes = parseEngine.getRoutesStruct();
        $jsonViewer.textContent = JSON.stringify(routes, null, 2);
      }).catch(err => {
        $errorDialogContent.textContent = err.message;
        $errorDialog.showModal();
        console.error(err);
      });
  }

  $panelTitle.forEach(($title) => {
    $title.addEventListener('click', () => {
      $title.classList.toggle('active');
    })
  });

  $errorDialogClose.addEventListener('click', () => {
    $errorDialog.close();
  });



  yamlViewer.setSize('100%', '100%');

  yamlEditor.setSize('100%', '100%');

  $generateBtn.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const content = yamlEditor.getValue();
    generate(content);
  })




  fetch("/api/config").then(res => res.json()).then(({ data }) => {
    let globalConfig = jsyaml.load(data.debugConfigContent);
    const scenceConfigs = globalConfig.ScenceConfigs;

    const $selectEnv = document.getElementById('select-env');
    $selectEnv.innerHTML = scenceConfigs.map(item => `<option value="${item.Url}">${item.Name}</option>`).join('');

    $selectEnv.addEventListener('change', (event) => {
      const filePath = event.target.value;
      fetch("/api/msa?filePath=" + filePath).then(res => res.json()).then(({ data }) => {
        if (data.content) {
          const currentScenceConfig = scenceConfigs.find(item => item.Url === filePath);
          yamlEditor.setValue(data.content);
          generate(data.content, globalConfig.Parameters, currentScenceConfig);
        }
      });
    });

    fetch("/api/msa?filePath=" + scenceConfigs[0].Url).then(res => res.json()).then(({ data }) => {
      if (data.content) {
        yamlEditor.setValue(data.content);
        generate(data.content, globalConfig.Parameters, scenceConfigs[0]);
      }
    })
  })
}






