#!/bin/zsh
# 打包商店提交用的 ZIP：只含扩展运行需要的文件
# 用法：zsh store/pack.sh
set -e
REPO=${0:A:h:h}
cd $REPO
VER=$(node -p 'require("./manifest.json").version')
OUT=$REPO/dist/qr-rightclick-v$VER.zip
FILES=(manifest.json bg.js content.js jsQR.min.js popup.html popup.css popup.js _locales icons donate LICENSE)

# 只打包已提交的版本，避免把本地未提交的改动带进去
if [[ -n $(git status --porcelain -- $FILES) ]]; then
  echo "有未提交的改动，先提交再打包：" >&2
  git status --short -- $FILES >&2
  exit 1
fi

TMP=$(mktemp -d)
git archive HEAD $FILES | tar -x -C $TMP
rm -f $TMP/icons/source.png
mkdir -p $REPO/dist
rm -f $OUT
(cd $TMP && zip -qr $OUT .)
rm -rf $TMP
echo "$OUT"
unzip -l $OUT | tail -1
