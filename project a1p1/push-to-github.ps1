# Script to push project to GitHub
# Run this script from the project directory

Write-Host "Initializing git repository..." -ForegroundColor Green
if (Test-Path .git) {
    Remove-Item -Recurse -Force .git
}
git init

Write-Host "Adding remote repository..." -ForegroundColor Green
git remote add origin https://github.com/Hazardiusoms/WebTechnologies.git

Write-Host "Staging files..." -ForegroundColor Green
git add .gitignore package.json package-lock.json server.js db.js README.md public views

Write-Host "Creating initial commit..." -ForegroundColor Green
git commit -m "Initial commit: FocusFlow habit tracker with MongoDB and full CRUD interface"

Write-Host "Setting main branch..." -ForegroundColor Green
git branch -M main

Write-Host "Pushing to GitHub..." -ForegroundColor Green
Write-Host "You may be prompted for GitHub credentials." -ForegroundColor Yellow
git push -u origin main

Write-Host "Done! Your project has been pushed to GitHub." -ForegroundColor Green
