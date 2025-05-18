let globalLayoutData = {};

fetch('keyboard_layouts.json')
  .then(response => response.json())
  .then(layoutData => {
    globalLayoutData = layoutData;
    createLayoutSections(globalLayoutData);

    window.easykeyb.getLayouts().then(savedIds => {
      document.querySelectorAll('.layout-checkbox').forEach(cb => {
        if (savedIds.includes(cb.value)) {
          cb.checked = true;
        }
      });
    }); 
  })
  .catch(error => console.error('Errore nel caricamento dei layout:', error));

function groupLayoutsByFirstLetter(layouts) {
  const result = {};
  layouts.forEach(layout => {
    const letter = layout.name[0].toUpperCase();
    if (!result[letter]) result[letter] = [];
    result[letter].push(layout);
  });
  return result;
}

function createLayoutSections(layouts) {
  const container = document.getElementById('layout-container');
  container.innerHTML = '';

  Object.keys(layouts).sort().forEach(letter => {
    const section = document.createElement('div');
    section.className = 'letter-section';

    const header = document.createElement('div');
    header.className = 'letter-header';
    header.textContent = letter;
    header.onclick = () => {
      document.querySelectorAll('.letter-section').forEach(s => s.classList.remove('active'));
      section.classList.add('active');
    };

    const content = document.createElement('div');
    content.className = 'letter-content';

    layouts[letter].forEach(layout => {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = layout.id;
      checkbox.className = 'layout-checkbox';

      const label = document.createElement('label');
      label.className = 'layout-item';
      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(` ${layout.name}`));

      content.appendChild(label);
      content.appendChild(document.createElement('br'));
    });

    section.appendChild(header);
    section.appendChild(content);
    container.appendChild(section);
  });
}

function getSelectedLayouts(groupedLayouts) {
  const selectedIds = Array.from(document.querySelectorAll('.layout-checkbox:checked'))
    .map(cb => cb.value);

  const selectedLayouts = [];

  for (const group of Object.values(groupedLayouts)) {
    for (const layout of group) {
      if (selectedIds.includes(layout.id)) {
        selectedLayouts.push(layout);
      }
    }
  }

  return selectedLayouts;
}

document.getElementById('ok-button').addEventListener('click', () => {
  const selectedIds = Array.from(document.querySelectorAll('.layout-checkbox:checked'))
    .map(cb => cb.value); // Solo gli ID

  window.easykeyb.saveLayouts(selectedIds); // Array di stringhe tipo ["00000401", "00010401"]
  window.easykeyb.closeSetupWindow();
});


document.getElementById('cancel-button').addEventListener('click', () => {
  window.easykeyb.closeSetupWindow();
});
