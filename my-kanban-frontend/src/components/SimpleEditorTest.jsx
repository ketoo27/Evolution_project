// src/components/SimpleEditorTest.jsx
import React, { useRef, useEffect } from 'react';
import { RichTextEditorComponent, Inject, HtmlEditor, Toolbar } from '@syncfusion/ej2-react-richtexteditor';

function SimpleEditorTest() {
    const editorRef = useRef(null);

    const handleSave = () => {
        console.log("Editor Ref (SimpleTest):", editorRef.current);
        if (editorRef.current && editorRef.current.getValue) {
            const content = editorRef.current.getValue();
            console.log("Editor Content (SimpleTest):", content);
            alert("Content logged to console! (SimpleTest)");
        } else {
            console.error("getValue is not a function on editorRef.current! (SimpleTest)");
            alert("getValue is not a function! Check console. (SimpleTest)");
        }
    };

    useEffect(() => {
        console.log("EditorRef in useEffect (SimpleTest):", editorRef.current);
    }, []);

    return (
        <div>
            <h1>Simple Rich Text Editor Test</h1>
            <RichTextEditorComponent ref={editorRef}>
                <Inject services={[HtmlEditor, Toolbar]} />
            </RichTextEditorComponent>
            <button onClick={handleSave}>Get Content and Log (SimpleTest)</button>
        </div>
    );
}

export default SimpleEditorTest;