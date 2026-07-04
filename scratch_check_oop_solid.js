const fs = require('fs');
const path = require('path');

const questionsPath = path.join(__dirname, 'src/features/interview-practice/data/questions.json');
const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));

console.log('Searching for OOP and SOLID in questions.json...');

const oopSolidQuestions = [];

questions.forEach(q => {
  const textToSearch = `${q.category} ${q.subcategory} ${q.q} ${q.q_en} ${q.a} ${q.a_en}`.toLowerCase();
  if (
    textToSearch.includes('solid') ||
    textToSearch.includes('oop') ||
    textToSearch.includes('object-oriented') ||
    textToSearch.includes('hướng đối tượng') ||
    textToSearch.includes('polymorphism') ||
    textToSearch.includes('da hinh') ||
    textToSearch.includes('đa hình') ||
    textToSearch.includes('inheritance') ||
    textToSearch.includes('kế thừa') ||
    textToSearch.includes('encapsulation') ||
    textToSearch.includes('đóng gói') ||
    textToSearch.includes('abstraction') ||
    textToSearch.includes('trừu tượng') ||
    textToSearch.includes('dependency inversion') ||
    textToSearch.includes('single responsibility')
  ) {
    oopSolidQuestions.push({
      id: q.id,
      category: q.category,
      subcategory: q.subcategory,
      q: q.q,
      q_en: q.q_en,
      level: q.level
    });
  }
});

console.log(`Found ${oopSolidQuestions.length} related questions:`);

// Group by category to see where they are located
const grouped = {};
oopSolidQuestions.forEach(q => {
  grouped[q.category] = (grouped[q.category] || 0) + 1;
});
console.log('\nGrouped by Category:', JSON.stringify(grouped, null, 2));

console.log('\nSample Questions:');
oopSolidQuestions.slice(0, 15).forEach(q => {
  console.log(`[ID: ${q.id}] Cat: ${q.category} | Level: ${q.level} | Q: ${q.q}`);
});
