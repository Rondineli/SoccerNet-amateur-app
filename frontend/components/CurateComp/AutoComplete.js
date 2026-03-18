"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";

/**
 * BasicAutocomplete
 * --------------------------------------------------
 * A simple controlled Material UI Autocomplete that works great in Next.js.
 *
 * Props:
 *  - label?: string
 *  - options: string[]
 *  - value?: string | null
 *  - onChange?: (value: string | null) => void
 */

export function BasicAutocomplete({
  label = "Choose option",
  options: outerOptions,
  value: outerValue,
  onChange,
}) {
  const [options, setOptions] = useState(outerOptions || []);
  const [value, setValue] = useState(outerValue || null);
  const [inputValue, setInputValue] = useState("");


  useEffect(() => {
    setValue(outerValue || null);
  }, [outerValue]);

  useEffect(() => {
    setOptions(outerOptions || []);
  }, [outerOptions]);

  return (
    <Autocomplete
      freeSolo
      options={options}
      value={value}
      inputValue={inputValue}
      onInputChange={(_, newInputValue) => {
        setInputValue(newInputValue);
        onChange?.(newInputValue);
        console.log(`Set onInputChange value`)

      }}
      onChange={(_, newValue) => {
        let finalValue = newValue;
        console.log(`Set onChange`)

        // If user typed something not in options
        if (typeof newValue === "string") {
          if (!options.includes(newValue)) {
            setOptions((prev) => [...prev, newValue]);
          }
          finalValue = newValue;
        }

        setValue(finalValue);
        onChange?.(finalValue);

        console.log("BasicAutocomplete saved:", finalValue);
      }}
      renderInput={(params) => (
        <TextField {...params} label={label} placeholder="Start typing…" />
      )}
      sx={{ width: 360 }}
    />
  );
}


/**
 * AsyncAutocomplete
 * --------------------------------------------------
 * A debounced, async-loading Autocomplete (great for large lists / server queries).
 *
 * Props:
 *  - label?: string
 *  - fetchOptions: (query: string) => Promise<string[]>   // your data loader
 *  - minLength?: number                                   // min chars before querying (default 2)
 *  - debounceMs?: number                                  // debounce time (default 300ms)
 *  - value?: string | null
 *  - onChange?: (value: string | null) => void
 *  - freeSolo?: boolean                                   // allow values not in list
 */
export function AsyncAutocomplete({
  label = "Search",
  fetchOptions,
  minLength = 2,
  debounceMs = 300,
  value: outerValue,
  onChange,
  freeSolo = false,
}) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(outerValue || "");
  const [value, setValue] = useState(outerValue || null);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const latestQueryRef = useRef("");

  useEffect(() => {
    setValue(outerValue || null);
    setInputValue(outerValue || "");
  }, [outerValue]);

  // Debounced loader
  const debouncedLoad = useMemo(() => {
    let timer = null;
    return (q) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(async () => {
        try {
          setLoading(true);
          latestQueryRef.current = q;
          const data = await fetchOptions(q);
          // only apply if this is the latest query
          if (latestQueryRef.current === q) setOptions(data);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(e);
          setOptions([]);
        } finally {
          setLoading(false);
        }
      }, debounceMs);
    };
  }, [fetchOptions, debounceMs]);

  useEffect(() => {
    if (!open) return;
    if (inputValue.length < minLength) {
      setOptions([]);
      return;
    }
    debouncedLoad(inputValue);
  }, [open, inputValue, minLength, debouncedLoad]);

  return (
    <Autocomplete
      freeSolo={freeSolo}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={options}
      value={value}
      inputValue={inputValue}
      onInputChange={(_, newInput) => setInputValue(newInput)}
      onChange={(_, newValue) => {
        const v = typeof newValue === "string" ? newValue : (newValue || null);
        setValue(v);
        onChange?.(v);
      }}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={minLength > 1 ? `Type at least ${minLength} characters…` : "Search…"}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      sx={{ width: 420 }}
    />
  );
}