var AdvHRDialog={init:function(b){var d=b.dom,c=document.forms[0],e=b.selection.getNode(),a;
a=d.getAttrib(e,"width");
c.width.value=a?parseInt(a):(d.getStyle("width")||"");
c.size.value=d.getAttrib(e,"size")||parseInt(d.getStyle("height"))||"";
c.noshade.checked=!!d.getAttrib(e,"noshade")||!!d.getStyle("border-width");
selectByValue(c,"width2",a.indexOf("%")!=-1?"%":"px")
},update:function(){var a=tinyMCEPopup.editor,c,d=document.forms[0],b="";
c="<hr";
if(d.size.value){c+=' size="'+d.size.value+'"';
b+=" height:"+d.size.value+"px;"
}if(d.width.value){c+=' width="'+d.width.value+(d.width2.value=="%"?"%":"")+'"';
b+=" width:"+d.width.value+(d.width2.value=="%"?"%":"px")+";"
}if(d.noshade.checked){c+=' noshade="noshade"';
b+=" border-width: 1px; border-style: solid; border-color: #CCCCCC; color: #ffffff;"
}if(a.settings.inline_styles){c+=' style="'+tinymce.trim(b)+'"'
}c+=" />";
a.execCommand("mceInsertContent",false,c);
tinyMCEPopup.close()
}};
tinyMCEPopup.requireLangPack();
tinyMCEPopup.onInit.add(AdvHRDialog.init,AdvHRDialog);