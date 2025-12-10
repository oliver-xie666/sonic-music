!include "MUI.nsh"
!define MUI_FINISHPAGE_LINK_LOCATION "https://MoeJue.cn"
!define MUI_FINISHPAGE_LINK "访问作者oliver-xie666主页"
!define MUI_FINISHPAGE_SHOWREADME_TEXT "访问 GitHub 项目主页"
!define MUI_FINISHPAGE_SHOWREADME "https://github.com/oliver-xie666/sonic-music"
!insertmacro MUI_PAGE_WELCOME

; Register the sonic:// protocol
!macro customInstall
  DeleteRegKey HKCR "sonic"
  WriteRegStr HKCR "sonic" "" "URL:sonic Music Protocol"
  WriteRegStr HKCR "sonic" "URL Protocol" ""
  WriteRegStr HKCR "sonic\DefaultIcon" "" "$INSTDIR\${PRODUCT_NAME}.exe,0"
  WriteRegStr HKCR "sonic\shell" "" ""
  WriteRegStr HKCR "sonic\shell\open" "" ""
  WriteRegStr HKCR "sonic\shell\open\command" "" '"$INSTDIR\${PRODUCT_NAME}.exe" "%1"'
!macroend