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
                        <button key={idx}
                                onClick={clicked}
                                id={item.track.id}
                        className={"listbox-button"}>
                            {item.track.name}
                        </button>)
                }
        </div>


    );
}

export default Listbox;