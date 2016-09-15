---
layout: post
title: Working with JSZip on the client-side
language: en
keywords: programming javascript jszip
---
```javascript
zip.generateAsync({ type: 'blob' })
.then(function(content) {
    var anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(content);
    anchor.setAttribute('download', 'credentials.zip');
    anchor.setAttribute('target', '_blank');
    // Append here for firefox
    document.body.appendChild(anchor);
    anchor.click();
});
```

This is not documented as of now.
