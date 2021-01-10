import React from 'react'

export default function Brain({decisions}) {
    return (
        <div>
            <ul>
                {decisions.map(thought => (<li key={thought.id}>{thought.body}</li>))}
            </ul>
            
        </div>
    )
}
