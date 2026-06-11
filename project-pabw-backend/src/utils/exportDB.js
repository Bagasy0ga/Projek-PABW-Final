import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backupDir = path.join(__dirname, '../../backups');

// Pastikan folder backups ada
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Path mysqldump untuk Laragon (sesuaikan versi MySQL jika berbeda)
const mysqldumpPaths = [
  'D:\\laragon\\bin\\mysql\\mysql-8.4.3-winx64\\bin\\mysqldump.exe',
  'D:\\laragon\\bin\\mysql\\mysql-8.4\\bin\\mysqldump.exe',
  'D:\\laragon\\bin\\mysql\\mysql8.4\\bin\\mysqldump.exe',
  'D:\\laragon\\bin\\mysql\\mysql8.0.26-0\\bin\\mysqldump.exe',
  'D:\\laragon\\bin\\mysql\\mysql5.7.36-0\\bin\\mysqldump.exe',
  'C:\\laragon\\bin\\mysql\\mysql8.0.26-0\\bin\\mysqldump.exe',
  'C:\\laragon\\bin\\mysql\\mysql5.7.36-0\\bin\\mysqldump.exe',
  'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe',
  'mysqldump' // Fallback ke system PATH
];

function getMysqldumpPath() {
  for (const filePath of mysqldumpPaths) {
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }
  return mysqldumpPaths[mysqldumpPaths.length - 1]; // Return fallback
}

export const exportDatabase = () => {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `pabw_backup_${timestamp}.sql`;
  const filepath = path.join(backupDir, filename);
  const mysqldump = getMysqldumpPath();

  const command = `"${mysqldump}" -h ${process.env.DB_HOST} -u ${process.env.DB_USER} -p${process.env.DB_PASSWORD} ${process.env.DB_NAME} > "${filepath}"`;

  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Export gagal: ${error.message}`));
      } else {
        resolve(`Database berhasil diexport ke: ${filepath}`);
      }
    });
  });
};

// Jalankan export jika file dijalankan langsung
exportDatabase()
  .then(msg => console.log(msg))
  .catch(err => console.error(err.message));
