import React from "react";
import AceEditor from "react-ace";
import ScrollTabs from "../ScrollTabs/ScrollTabs";

import * as ace from "ace-builds/src-noconflict/ace";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-solarized_light";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/snippets/python";
import "ace-builds/webpack-resolver";
import "ace-builds/src-noconflict/ext-beautify";
import "./Editor.css";
import { Box, Button, Container, Stack } from "@mui/material";
import "./Editor.css";
import ReactAce from "react-ace/lib/ace";
import AddIcon from "@mui/icons-material/Add";
import { Ace } from "ace-builds";
import FormDialogCreateFile from "../FormDialogCreateFile/FormDialogCreateFile";
import CircularIndeterminate from "../common/CircularInderminate";
import { Buffer } from "buffer";

interface IEditorProps {
  team: string;
  user: string;
  loadFile: {
    name: string;
    id: string;
  };
  server: string;
}

interface downloadMap {
  [name: string]: string;
}

interface IFile {
  tab: string;
  id: number;
  session: Ace.EditSession | undefined;
  mode: string;
}
interface IEditorState {
  fileList: IFile[];
  chosenFile: number;
  fileDialogOpen: boolean;
  editorDestroyed: boolean;
  downloading: boolean;
  downloads: downloadMap;
  downloadStarted: boolean;
}
class Editor extends React.Component<IEditorProps, IEditorState> {
  ref;
  static supportedLanguages = [
    {
      lang: "python",
      key: 1,
      ext: "py",
    },
    {
      lang: "javascript",
      key: 2,
      ext: "js",
    },
  ];

  constructor(props: any) {
    super(props);
    this.ref = React.createRef<ReactAce>();
    this.state = {
      fileList: [],
      // TODO: To set initial file, could be loaded from props for lab session
      // [{
      //   tab: "file 1",
      //   session: this.ref.current?.editor.getSession(),
      //   id: 1,
      //   mode: "python"
      // }]
      chosenFile: -1,
      fileDialogOpen: false,
      editorDestroyed: false,
      downloading: false,
      downloads: {},
      downloadStarted: false,
    };
    this.addFile = this.addFile.bind(this);
    this.setChosenFile = this.setChosenFile.bind(this);
    this.closeAddFileDialog = this.closeAddFileDialog.bind(this);
  }
  componentWillMount(): void {
    this.setState((state) => {
      const newState = { ...state };
      // newState.fileList[0].session = this.ref.current?.editor.getSession();
      this.ref.current?.editor.destroy();
      newState.editorDestroyed = true;
      return newState;
    });
  }
  // Update State on props update
  // Load Downloaded file
  static getDerivedStateFromProps(props: IEditorProps, state: IEditorState) {
    // check loadfile
    console.log(Object.keys(state.downloads));
    console.log(props.loadFile.name in state.downloads);
    console.log(props.loadFile.name);
    if (!(props.loadFile.name in state.downloads)) {
      if (props.loadFile.name !== "") {
        if (!state.downloading) {
          return { downloading: true };
        }
      } // else this.setState({ downloading: false });
      // loadfile changed
    }
    return null;
  }
  componentDidUpdate(
    prevProps: Readonly<IEditorProps>,
    prevState: Readonly<IEditorState>,
    snapshot?: any
  ): void {
    if (this.state.downloading && !this.state.downloadStarted) {
      this.setState({ downloadStarted: true });
      Editor.downloadFile(
        this.props.server,
        this.props.loadFile.name,
        this.props.loadFile.id
      ).then((text) => {
        if (text === null) {
          // download failed
          this.setState({ downloading: false });
          return null;
        }
        // download succeded
        const fileExt = this.props.loadFile.name.split(".").slice(-1)[0];
        const language = Editor.supportedLanguages.filter(
          (sl) => sl.ext === fileExt
        );
        let mode = "";
        if (language.length === 0) {
          console.log("Language not supported! Ext: " + fileExt);
        } else {
          mode = language[0].lang;
        }
        let downloads = this.state.downloads;
        downloads[this.props.loadFile.name] = text;
        this.setState({ downloads });
        this.addToFileList(this.props.loadFile.name, mode);
        this.setState({ downloading: false, downloadStarted: false });
      });
    }
    // Change Editor Context
    if (this.state.chosenFile !== prevState.chosenFile) {
      // File session did not exist, new session needed
      const file = this.state.fileList[this.state.chosenFile];
      // If invalid file do nothing
      if (!file) return;
      let new_session = this.state.fileList[this.state.chosenFile].session;

      if (this.ref.current && this.state.editorDestroyed) {
        // Editor was destoryed create new editor
        this.ref.current.editor = ace.edit("aceeditor");
        this.ref.current.editor.setOptions({
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          enableSnippets: true,
          showLineNumbers: true,
          tabSize: 2,
          useSoftTabs: true,
        });
        this.setState({ editorDestroyed: false });
      }
      // const updatedFileList = this.state.fileList.map((file, index) => {
      //   if (index !== prevState.chosenFile) return file;
      //   file.session = this.ref.current?.editor.getSession();
      //   return file;
      // });
      if (new_session) {
        this.ref.current?.editor.setSession(new_session);
        return;
      } else {
        console.log(`Creating Session. File ${file.tab} Mode: ${file.mode}`);
        file.session = this.createNewSession(file);
        this.ref.current?.editor.setSession(file.session);
      }
      // this.setState({ fileList: updatedFileList });
    }
  }
  createNewSession(file: IFile) {
    // Creating new session
    const fileContents = this.state.downloads[file.tab] || "Default";
    const session: Ace.EditSession = ace.createEditSession(
      fileContents,
      file.mode
    );
    // check if file was new or was downloaded
    console.log("changing: ", fileContents.length);
    session.setValue(fileContents);
    session.setMode(`ace/mode/${file.mode}`);
    session.setTabSize(2);
    session.setUseSoftTabs(true);
    return session;
  }
  closeAddFileDialog(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void {
    console.log("Closing");
    console.log(event.currentTarget.value);
    this.setState({ fileDialogOpen: false });
  }
  addFile(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const filename = data.get("filename") as string;
    const lang = data.get("langSelect") as string;
    this.addToFileList(filename, lang);
  }
  addToFileList(
    filename: string,
    lang: string,
    session: Ace.EditSession | undefined = undefined
  ) {
    const newFileList = this.state.fileList.concat({
      tab: filename,
      session,
      id: (this.state.fileList.slice(-1)[0]?.id || 0) + 1,
      mode: lang,
    });
    this.setState({ fileList: newFileList });
    if (newFileList.length === 1) {
      this.setState({ chosenFile: 0 });
    }
  }
  setChosenFile(chosen: number) {
    this.setState({ chosenFile: chosen });
  }
  static async downloadFile(server: string, file: string, id: string) {
    console.log("Downloading file", file);
    return fetch(`${server}/filemanager/download?items=${id}`, {
      method: "GET",
    }).then((resp) => {
      if (resp.ok) {
        return resp.text().then((text) => Buffer.from(text, "utf8").toString());
      }
      return null;
    });
  }
  render() {
    return (
      <Stack flex={1} direction="column">
        <Stack direction={"row"}>
          <ScrollTabs
            tabList={this.state.fileList}
            setChosen={this.setChosenFile}
          />
          <Box
            sx={{
              backgroundColor: "#f1f1f1",
              display: "flex",
              width: "fit-content",
              flexDirection: "row",
            }}
          >
            <FormDialogCreateFile
              open={this.state.fileDialogOpen}
              handleClose={this.closeAddFileDialog}
              handleSubmit={this.addFile}
              languages={Editor.supportedLanguages}
            />
            <Button
              variant="contained"
              color="primary"
              size="small"
              sx={{
                margin: "8px",
              }}
              onClick={() => {
                this.setState({ fileDialogOpen: true });
              }}
            >
              <AddIcon></AddIcon>
            </Button>
            <Button
              variant="contained"
              component="label"
              size="small"
              sx={{
                margin: "8px",
              }}
            >
              Upload
              <input hidden accept="image/*" multiple type="file" />
            </Button>
          </Box>
        </Stack>
        <Box flex={1}>
          {this.state.downloading ? (
            <Container>
              Loading File {this.props.loadFile.name} <CircularIndeterminate />
            </Container>
          ) : null}
          <AceEditor
            className="editor"
            style={{
              width: "100%",
              height: "100%",
            }}
            theme="github"
            name="aceeditor"
            ref={this.ref}
            onLoad={(editorInstance) => {
              editorInstance.resize();
              editorInstance.container.style.resize = "both";
              // mouseup = css resize end
              document.addEventListener("mouseup", (e) => {
                editorInstance.resize();
              });
            }}
            showPrintMargin={true}
            showGutter={true}
            highlightActiveLine={true}
            setOptions={{
              enableBasicAutocompletion: true,
              enableLiveAutocompletion: true,
              enableSnippets: true,
              showLineNumbers: true,
              tabSize: 2,
            }}
          />
        </Box>
      </Stack>
    );
  }
}

export default Editor;
