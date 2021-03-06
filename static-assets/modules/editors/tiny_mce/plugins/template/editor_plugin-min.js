(function(){var b=tinymce.each;
tinymce.create("tinymce.plugins.TemplatePlugin",{init:function(a,f){var e=this;
e.editor=a;
a.addCommand("mceTemplate",function(c){a.windowManager.open({file:f+"/template.htm",width:a.getParam("template_popup_width",750),height:a.getParam("template_popup_height",600),inline:1},{plugin_url:f})
});
a.addCommand("mceInsertTemplate",e._insertTemplate,e);
a.addButton("template",{title:"template.desc",cmd:"mceTemplate"});
a.onPreProcess.add(function(h,c){var d=h.dom;
b(d.select("div",c.node),function(g){if(d.hasClass(g,"mceTmpl")){b(d.select("*",g),function(j){if(d.hasClass(j,h.getParam("template_mdate_classes","mdate").replace(/\s+/g,"|"))){j.innerHTML=e._getDateTime(new Date(),h.getParam("template_mdate_format",h.getLang("template.mdate_format")))
}});
e._replaceVals(g)
}})
})
},getInfo:function(){return{longname:"Template plugin",author:"Moxiecode Systems AB",authorurl:"http://www.moxiecode.com",infourl:"http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/template",version:tinymce.majorVersion+"."+tinymce.minorVersion}
},_insertTemplate:function(l,h){var a=this,m=a.editor,o,r,q=m.dom,s=m.selection.getContent();
o=h.content;
b(a.editor.getParam("template_replace_values"),function(c,d){if(typeof(c)!="function"){o=o.replace(new RegExp("\\{\\$"+d+"\\}","g"),c)
}});
r=q.create("div",null,o);
n=q.select(".mceTmpl",r);
if(n&&n.length>0){r=q.create("div",null);
r.appendChild(n[0].cloneNode(true))
}function p(c,d){return new RegExp("\\b"+d+"\\b","g").test(c.className)
}b(q.select("*",r),function(c){if(p(c,m.getParam("template_cdate_classes","cdate").replace(/\s+/g,"|"))){c.innerHTML=a._getDateTime(new Date(),m.getParam("template_cdate_format",m.getLang("template.cdate_format")))
}if(p(c,m.getParam("template_mdate_classes","mdate").replace(/\s+/g,"|"))){c.innerHTML=a._getDateTime(new Date(),m.getParam("template_mdate_format",m.getLang("template.mdate_format")))
}if(p(c,m.getParam("template_selected_content_classes","selcontent").replace(/\s+/g,"|"))){c.innerHTML=s
}});
a._replaceVals(r);
m.execCommand("mceInsertContent",false,r.innerHTML);
m.addVisual()
},_replaceVals:function(f){var e=this.editor.dom,a=this.editor.getParam("template_replace_values");
b(e.select("*",f),function(c){b(a,function(d,h){if(e.hasClass(c,h)){if(typeof(a[h])=="function"){a[h](c)
}}})
})
},_getDateTime:function(d,a){if(!a){return""
}function f(c,h){var e;
c=""+c;
if(c.length<h){for(e=0;
e<(h-c.length);
e++){c="0"+c
}}return c
}a=a.replace("%D","%m/%d/%y");
a=a.replace("%r","%I:%M:%S %p");
a=a.replace("%Y",""+d.getFullYear());
a=a.replace("%y",""+d.getYear());
a=a.replace("%m",f(d.getMonth()+1,2));
a=a.replace("%d",f(d.getDate(),2));
a=a.replace("%H",""+f(d.getHours(),2));
a=a.replace("%M",""+f(d.getMinutes(),2));
a=a.replace("%S",""+f(d.getSeconds(),2));
a=a.replace("%I",""+((d.getHours()+11)%12+1));
a=a.replace("%p",""+(d.getHours()<12?"AM":"PM"));
a=a.replace("%B",""+this.editor.getLang("template_months_long").split(",")[d.getMonth()]);
a=a.replace("%b",""+this.editor.getLang("template_months_short").split(",")[d.getMonth()]);
a=a.replace("%A",""+this.editor.getLang("template_day_long").split(",")[d.getDay()]);
a=a.replace("%a",""+this.editor.getLang("template_day_short").split(",")[d.getDay()]);
a=a.replace("%%","%");
return a
}});
tinymce.PluginManager.add("template",tinymce.plugins.TemplatePlugin)
})();