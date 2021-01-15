import React from 'react';

const Listbox = props => {

    const clicked = e => {
        e.preventDefault();
        props.clicked(e.target.id);
    }

    return (
        <div className="listbox">
            {
                props.items.map((item, idx) =>
                    <div className={"listbox-button"} key={idx+item.track.id + idx}>
                        <button key={idx}
                            onClick={clicked}
                            id={item.track.id}>
                            {item.track.name}
                        </button>
                    </div>)
            }
        </div>


    );
}

export default Listbox;