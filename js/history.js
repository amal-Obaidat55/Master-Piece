const list = $('#rows');
const searchBox = $('#f-q');
const statusBox = $('#f-status');
const typeBox = $('#f-type');
const sortBox = $('#f-sort');
const noMatch = $('#no-match');

function updateList() {
  const text = searchBox.value.trim().toLowerCase();
  const rows = $$('[data-row]', list);

  let shown = 0;
  rows.forEach(function (row) {
    const okText = row.dataset.title.toLowerCase().includes(text);
    const okStatus = !statusBox.value || row.dataset.status === statusBox.value;
    const okType = !typeBox.value || row.dataset.type === typeBox.value;
    row.hidden = !(okText && okStatus && okType);
    if (!row.hidden) shown++;
  });
  noMatch.hidden = shown > 0;            

  const order = sortBox.value;
  rows.sort(function (a, b) {
    if (order === 'oldest') return a.dataset.date.localeCompare(b.dataset.date);
    if (order === 'score_desc') return b.dataset.score - a.dataset.score;
    if (order === 'score_asc') return a.dataset.score - b.dataset.score;
    return b.dataset.date.localeCompare(a.dataset.date);          
  });
  rows.forEach(function (row) { list.appendChild(row); });
}

searchBox.addEventListener('input', updateList);
[statusBox, typeBox, sortBox].forEach(function (box) { box.addEventListener('change', updateList); });
$('#filters').addEventListener('submit', function (e) { e.preventDefault(); });
