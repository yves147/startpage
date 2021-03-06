import React, { createContext, useCallback, useEffect, useState, useContext } from 'react'
import { addConfigId } from '../../modules/configId'
import { isWindows } from '../../modules/isWindows'
import process from 'process'

const CONFIG_KEY = 'config'

const ConfigContext = createContext()

const ConfigProvider = ({ config: overridingConfig, children }) => {
    const [config, setRealConfig] = useState({})
    const [editing, setEditing] = useState(false)
    const url = 'https://proxy.mystube.com/config.json'

    const setConfig = useCallback((configValue) => {
        setRealConfig(addConfigId(configValue))
    }, [])

    const getConfig = useCallback(async () => {
        // Give highest priority to the overriding config
        if (overridingConfig) {
            setConfig(overridingConfig)

            return 
        }

        // Check localstorage for config
        const localConfig = localStorage.getItem(CONFIG_KEY)
        if (localConfig) {
            setConfig(JSON.parse(localConfig))

            return
        }
        
        // Else fetch the default file
        const result = await fetch(url).then(response => response.json())

        setConfig(result)
    }, [overridingConfig, setConfig, url])

    const updateConfig = useCallback(newConfig => {
        setConfig(newConfig)
    }, [setConfig])

    const resetConfig = useCallback(() => {
        getConfig()
    }, [getConfig])

    const clearConfig = useCallback(() => {
        localStorage.removeItem(CONFIG_KEY)
        getConfig()
    }, [getConfig])

    useEffect(() => {
        getConfig()
    }, [getConfig])

    // Keyboard shortcut for Editing mode
    useEffect(() => {
        const listner = document.addEventListener('keydown', event => {
            const modifierKey = isWindows() ? 'ctrlKey' : 'metaKey'

            if (event.key === 'e' && event[modifierKey] === true) {
                setEditing(val => !val)
            }

            if (event.key === 'Escape') {
                setEditing(false)
            }
        })
        return () => {
            document.removeEventListener('keypress', listner)
        }
    }, [])

    useEffect(() => {
        localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
    }, [config])

    return (
        <ConfigContext.Provider value={{ config, updateConfig, resetConfig, clearConfig, editing, setEditing }}>
            {children}
        </ConfigContext.Provider>
    )
}

const useConfigContext = () => {
    return useContext(ConfigContext)
}

export {
    ConfigProvider,
    ConfigContext,
    useConfigContext,
    useConfigContext as default,
}
