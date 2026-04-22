const fs = require('fs');
let content = fs.readFileSync('app/admin/dashboard/page.tsx', 'utf8');
const oldAnnounce = `<div className="announce-item">
                <div className="announce-title">ยังไม่มีประกาศ</div>
                <div className="announce-date">เริ่มโพสประกาศได้เลย</div>
              </div>`;
const newAnnounce = `{recentAnnouncements.length > 0 ? recentAnnouncements.map((announcement) => (
                <div key={announcement.id} className="announce-item">
                  <div className="announce-title">{announcement.title}</div>
                  <div className="announce-date">{new Date(announcement.created_at).toLocaleDateString('th-TH')}</div>
                </div>
              )) : (
                <div className="announce-item">
                  <div className="announce-title">ยังไม่มีประกาศ</div>
                  <div className="announce-date">เริ่มโพสประกาศได้เลย</div>
                </div>
              )}`;
content = content.replace(oldAnnounce, newAnnounce);
fs.writeFileSync('app/admin/dashboard/page.tsx', content);
console.log('Fixed announcements');
