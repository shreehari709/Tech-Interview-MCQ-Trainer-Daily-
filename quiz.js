
const KEYS = { LAST_COMPLETED: 'lastCompletedDate' };

async function loadQuestions() {
  const res = await fetch('questions.json');
  return await res.json();
}

function sampleFive(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, 5);
}

function renderQuiz(questions) {
  const mount = document.getElementById('quiz');
  mount.innerHTML = '';
  questions.forEach((q, idx) => {
    const section = document.createElement('section');
    section.className = 'q';
    section.innerHTML = `
      <h3>Q${idx+1}. <span style="opacity:.8">[${q.category}]</span> ${q.prompt}</h3>
      <div class="opts">
        ${q.options.map((opt, i) => `
          <label class="opt">
            <input type="radio" name="q${idx}" value="${i}">
            <span>${opt}</span>
          </label>
        `).join('')}
      </div>
    `;
    mount.appendChild(section);
  });
}

function allAnswered(count) {
  for (let i = 0; i < count; i++) {
    if (!document.querySelector(`input[name="q${i}"]:checked`)) return false;
  }
  return true;
}

function getAnswers(count) {
  const answers = [];
  for (let i = 0; i < count; i++) {
    const picked = document.querySelector(`input[name="q${i}"]:checked`);
    answers.push(picked ? parseInt(picked.value, 10) : null);
  }
  return answers;
}

function showResults(questions, picks) {
  const result = document.getElementById('result');
  let score = 0;
  const lines = questions.map((q, i) => {
    const correct = q.correctIndex;
    const picked = picks[i];
    const ok = picked === correct;
    if (ok) score++;
    const your = picked !== null ? q.options[picked] : '—';
    return `Q${i+1} [${q.category}]: ${ok ? '✅' : '❌'} • Correct: ${q.options[correct]}${ok ? '' : ` • Your answer: ${your}`}`;
  });
  result.style.display = 'block';
  result.innerHTML = `<h3>Score: ${score}/5</h3><pre>${lines.join('\n')}</pre>`;
}

function todayStr() { return new Date().toISOString().slice(0,10); }

document.addEventListener('DOMContentLoaded', async () => {
  const bank = await loadQuestions();
  let set = sampleFive(bank);
  renderQuiz(set);

  const submit = document.getElementById('submit');
  const retry = document.getElementById('retry');
  const result = document.getElementById('result');

  document.getElementById('quiz').addEventListener('change', () => {
    submit.disabled = !allAnswered(set.length);
  });

  submit.addEventListener('click', async () => {
    const picks = getAnswers(set.length);
    showResults(set, picks);
    submit.disabled = true;
    retry.style.display = 'inline-block';
    await chrome.storage.local.set({ [KEYS.LAST_COMPLETED]: todayStr() });
  });

  retry.addEventListener('click', () => {
    result.style.display = 'none';
    submit.disabled = true;
    set = sampleFive(bank);
    renderQuiz(set);
  });
});
