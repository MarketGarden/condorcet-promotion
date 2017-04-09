param($ghpagesPath="..\condoret-promotion-github")

&ng build --prod

$ghpagesPath = Resolve-Path $ghpagesPath;
$WebpackPath = "$PsscriptRoot\dist"


ls "$ghpagesPath\*" | % {
    write-host ">git rm $_"
    git --git-dir="$ghpagesPath"  rm $_.fullname
}



rm "$ghpagesPath\*"
write-host "ghpagesPath cleaned"
ls $ghpagesPath


copy "$WebpackPath\*" $ghpagesPath
write-host "ghpagesPath loaded with new files"

ls "$ghpagesPath\*" | % {
    write-host ">git add $_"
    git --git-dir="$ghpagesPath"  rm $_.fullname
}
git --git-dir="$ghpagesPath" commit -m "release WebUI"
