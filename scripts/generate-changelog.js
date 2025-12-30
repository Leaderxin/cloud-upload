#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径（ES模块方式）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 获取最新的 git 标签和提交信息
function getLatestTag() {
  try {
    const tag = execSync('git describe --tags --abbrev=0', { encoding: 'utf-8' }).trim();
    console.log('Latest tag:', tag);
    return tag;
  } catch (error) {
    console.log('No tags found or git error:', error.message);
    return null;
  }
}

function getCommitsSinceTag(tag) {
  try {
    const command = tag 
      ? `git log ${tag}..HEAD --pretty=format:"%s (%h)" --no-merges`
      : `git log --pretty=format:"%s (%h)" --no-merges`;
    
    console.log('Executing git command:', command);
    const commits = execSync(command, { encoding: 'utf-8' }).trim();
    console.log('Commits found:', commits);
    return commits.split('\n').filter(line => line.length > 0);
  } catch (error) {
    console.log('Git log error:', error.message);
    // 如果无法获取 Git 信息，返回空数组
    return [];
  }
}

function getCurrentVersion() {
  const packagePath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  console.log('Current version:', packageJson.version);
  return packageJson.version;
}

function updateChangelog() {
  const readmePath = path.join(__dirname, '..', 'README.md');
  let readmeContent = fs.readFileSync(readmePath, 'utf-8');
  
  const currentVersion = getCurrentVersion();
  const latestTag = getLatestTag();
  const commits = getCommitsSinceTag(latestTag);
  
  console.log('Processing changelog for version:', currentVersion);
  console.log('Latest tag:', latestTag);
  console.log('Commits count:', commits.length);
  
  // 更新 README.md 中的更新说明部分
  const startMarker = '<!-- 自动生成的更新日志开始 -->';
  const endMarker = '<!-- 自动生成的更新日志结束 -->';
  
  const startIndex = readmeContent.indexOf(startMarker);
  const endIndex = readmeContent.indexOf(endMarker);
  
  if (startIndex !== -1 && endIndex !== -1) {
    // 查找现有的更新日志内容
    const existingChangelog = readmeContent.substring(startIndex + startMarker.length, endIndex).trim();
    
    // 检查当前版本是否已经有更新日志
    const versionHeader = `### v${currentVersion}`;
    const versionExists = existingChangelog.includes(versionHeader);
    
    if (versionExists) {
      console.log(`版本 v${currentVersion} 的更新日志已存在，跳过更新`);
      return;
    }
    
    // 生成更新日志内容
    let changelogContent = `### v${currentVersion} (${new Date().toISOString().split('T')[0]})\n\n`;
    
    if (commits.length > 0) {
      changelogContent += commits.map(commit => `- ${commit}`).join('\n') + '\n\n';
    } else {
      // 如果没有 Git 提交信息，添加默认的更新内容
      changelogContent += '- 更新说明功能已添加\n';
      changelogContent += '- 支持自动生成更新日志\n';
      changelogContent += '- 优化组件性能和稳定性\n\n';
    }
    
    console.log('Generated changelog content:', changelogContent);
    
    const beforeContent = readmeContent.substring(0, startIndex + startMarker.length);
    const afterContent = readmeContent.substring(endIndex);
    
    // 将新的更新日志添加到顶部
    const newChangelog = beforeContent + '\n\n' + changelogContent + existingChangelog + afterContent;
    
    fs.writeFileSync(readmePath, newChangelog, 'utf-8');
    console.log('更新日志已更新到 README.md');
  } else {
    console.error('未找到更新日志标记，请确保 README.md 包含正确的标记');
    process.exit(1);
  }
}

// 执行更新
updateChangelog();
console.log('更新日志生成完成');