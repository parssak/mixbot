import React, {useState, useEffect} from 'react';
import './css_files/App.scss';
import UpdateMixBot from './frontend_components/UpdateMixBot';
import { Gateway } from './helper_classes/Gateway';
import Mixbot from './Mixbot';

const version = "0.1";

function App() {
    const [updateAvailable, setUpdateAvailable] = useState(null);
    const [updateContent, setUpdateContent] = useState(null);

    useEffect(() => {
        async function checkForUpdate() {
            const gateway = new Gateway();
            console.log("Checking for update...");
            let newestVersion = await gateway.checkForUpdate(version);
            console.log("Checking for update... GOT", newestVersion);
            let needUpdate = version !== newestVersion.version;
            console.log(needUpdate);
            if (needUpdate) {
                setUpdateContent(newestVersion.newFeatures);
                setUpdateAvailable(true);
            } else {
                setUpdateAvailable(false);
            }
        }
        checkForUpdate();
    }, [])

    function dontCare() {
        setUpdateAvailable(false);
    }

    return(
        <div className={"body"}>
            <div className={"title"}>
                <h1>MIXBOT</h1>
                <div className={"credits"}>
                    <h3>An Open Source project by Parssa Kyanzadeh</h3> 
                 </div>
            </div>
            {updateAvailable != null ? updateAvailable ? <UpdateMixBot details={updateContent} dontCare={dontCare}/> :<Mixbot/> : null}            
        </div>
    );
}
export default App;
