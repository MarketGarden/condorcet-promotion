param($ghpagesPath="..\condoret-promotion-github")

$ghpagesPath = Resolve-Path $ghpagesPath;
$WebpackPath = "$PsscriptRoot\dist"



ls "$ghpagesPath\*" | % {
    write-host ">git rm $_"
    git --git-dir="$ghpagesPath"  rm $_.fullname
}

#&ng build --prod

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


cd $PsscriptRoot