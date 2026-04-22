const fs = require('fs');
let content = fs.readFileSync('app/admin/dashboard/page.tsx', 'utf8');
content = content.replace(/num: stats\.classrooms\.toString\(\), bg: '#f0fdf4'/g, "num: stats.students.toString(), bg: '#f0fdf4'");
content = content.replace(/num: stats\.classrooms\.toString\(\), bg: '#fff7ed'/g, "num: stats.subjects.toString(), bg: '#fff7ed'");
content = content.replace(/num: stats\.classrooms\.toString\(\), bg: '#fdf4ff'/g, "num: stats.assignments.toString(), bg: '#fdf4ff'");
fs.writeFileSync('app/admin/dashboard/page.tsx', content);
console.log('Fixed stats');
