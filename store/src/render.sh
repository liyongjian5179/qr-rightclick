#!/bin/zsh
# 用法：zsh store/src/render.sh   （改了版本号或文案后重新生成 store/*.png）
# 渲染全部商店素材到 store/
set -e
HERE=${0:A:h}; STORE=$HERE REPO=${HERE:h:h} PORT=8766
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
node $HERE/serve.js $STORE $REPO $PORT > /tmp/qr-store-srv.log 2>&1 &
SRV=$!
trap "kill $SRV 2>/dev/null" EXIT
sleep 1
shot() { # 页面 输出 宽 高
  "$CH" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --user-data-dir=/tmp/qr-store-prof --virtual-time-budget=4000 \
    --window-size=$3,$4 --screenshot=$HERE/../$2 "http://127.0.0.1:$PORT/$1" >/dev/null 2>&1
  echo "$2 $(sips -g pixelWidth -g pixelHeight $HERE/../$2 | awk '/pixel/{printf $2" "}')"
}
shot shot1-menu.html       1-context-menu.png  1280 800
shot shot2-multi.html      2-multiple-codes.png 1280 800
shot shot3-result.html     3-links-and-text.png 1280 800
shot shot4-privacy.html    4-privacy.png       1280 800
shot shot5-popup.html      5-popup.png         1280 800
shot promo-small.html      promo-small-440x280.png 440 280
shot promo-marquee.html    promo-marquee-1400x560.png 1400 560
