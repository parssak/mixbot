import React, {useState, useEffect} from 'react';
import './css_files/App.scss';
import { Gateway } from './helper_classes/Gateway';
import Mixbot from './Mixbot';

const version = "0.2";

function App() {
    const [updateAvailable, setUpdateAvailable] = useState(null);

    useEffect(() => {
        async function checkForUpdate() {
            const gateway = new Gateway();
            console.log("Checking for update...");
            let newestVersion = await gateway.checkForUpdate(version);
            console.log("Checking for update... GOT", newestVersion);
            let needUpdate = version === newestVersion.version;
            console.log(needUpdate);
            if (needUpdate) {
                setUpdateAvailable(newestVersion);
                console.log("NEED TO UPDATE");
            } else {
                console.log("UP TO DATE");
            }
        }
        checkForUpdate();
    }, [])

    return(
        <div className={"body"}>
            <div className={"title"}>
                <h1>MIXBOT</h1>
                <div className={"credits"}>
                    <h3>An Open Source project by Parssa Kyanzadeh</h3> 
                 </div>
            </div>
            {!updateAvailable && <Mixbot />}
            
        </div>
    );
}
export default App;
