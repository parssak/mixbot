import React from 'react'
import './css_files/Queue.scss';
import { thoughtType } from './Mixbot';

export default function Brain({ decisions }) {

    const entryColor = type => {
        let color = '#7f7b80';
        switch (type) {
            case thoughtType.SUCCESS:
                color = '#48e26f';
                break;
            case thoughtType.FAILURE:
                color = '#e24848';
                break;
            case thoughtType.MIX:
                color = 'tomato';
                break;
            default:
                break;
        }
        
        return color;
    }

    return (
        <div className="queue-header" style={{ flexGrow: 1 }}>
            <h2>MIXBOT BRAIN</h2>
            <div className="queue">
                {decisions.map(thought => (
                <>
                        {thought.display && <div className={"entry"} key={thought.id}>
                            <p key={thought.id + "thought"} style={{ color: `${entryColor(thought.type)}` }}>{thought.body}</p>
                        </div>}
                </>))}
            </div>
        </div>
    )
}
