let globalLayoutData = {};

fetch('keyboard_layouts.json')
  .then(response => response.json())
  .then(layoutData => {
    globalLayoutData = layoutData;
    
    window.easykeyb.getLayouts().then(savedLayoutIds => {
      createLayoutSections(globalLayoutData, savedLayoutIds);
    });

    window.easykeyb.getLayouts().then(savedIds => {
      document.querySelectorAll('.layout-checkbox').forEach(cb => {
        if (savedIds.includes(cb.value)) {
          cb.checked = true;
        }
      });
    }); 
  })
  .catch(error => console.error('Error loading layouts:', error));

function groupLayoutsByFirstLetter(layouts) {
  const result = {};
  layouts.forEach(layout => {
    const letter = layout.name[0].toUpperCase();
    if (!result[letter]) result[letter] = [];
    result[letter].push(layout);
  });
  return result;
}

function createLayoutSections(layouts, savedLayoutIds = []) {
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

        checkbox.addEventListener('change', () => {
          const allChecked = document.querySelectorAll('.layout-checkbox:checked');
          const section = checkbox.closest('.letter-section');
          const header = section.querySelector('.letter-header');

          // Update the group style
          const anyChecked = Array.from(section.querySelectorAll('.layout-checkbox')).some(cb => cb.checked);
          header.classList.toggle('selected', anyChecked);

          // Limit to 10 selections
          if (checkbox.checked && allChecked.length > 10) {
            checkbox.checked = false;
            showError('You can select up to 10 keyboard layouts.');
          }
        });

      // If it was previously selected, mark it checked
      if (savedLayoutIds.includes(layout.id)) {
        checkbox.checked = true;
      }

      // Listen to the changes to update the group bold
      checkbox.addEventListener('change', () => {
        const anyChecked = Array.from(section.querySelectorAll('.layout-checkbox')).some(cb => cb.checked);
        header.classList.toggle('selected', anyChecked);
      });

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

    // Set bold if at least one layout is selected by default
    const anyInitiallyChecked = layouts[letter].some(layout => savedLayoutIds.includes(layout.id));
    if (anyInitiallyChecked) {
      header.classList.add('selected');
    }
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

function showError(message) {
  const box = document.getElementById('error-message');
  box.textContent = message;
  box.style.display = 'block';

  // Hide after 4 seconds
  setTimeout(() => {
    box.style.display = 'none';
  }, 4000);
}

document.getElementById('ok-button').addEventListener('click', () => {
  const selectedIds = Array.from(document.querySelectorAll('.layout-checkbox:checked'))
    .map(cb => cb.value); // Only the ID

  window.easykeyb.saveLayouts(selectedIds); // Array string as ["00000401", "00010401"]
  window.easykeyb.closeSetupWindow();
});


document.getElementById('cancel-button').addEventListener('click', () => {
  window.easykeyb.closeSetupWindow();
});
