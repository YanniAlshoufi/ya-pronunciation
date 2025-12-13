function log {
    param (
        [string]$msg
    )
    echo "$msg"
    echo "$msg" >> "make-inserts.log"
}

log "---------------------------------------------------------------------------------------"

log "Going through all CSV files..."

$validWordRegex = '^[a-zA-ZäöüÄÖÜß]+$'

ls *.csv | % {
    log "==============================="
    log "Adding inserts for file $_"
    log "==============================="

    $level = $_.BaseName
    $file = $_.FullName

    $statements = ""

    (import-csv $file -Delimiter ',') | % {
        $word = $_.Lemma.Trim()
        
        # Filter invalid words
        if (!($word -match $validWordRegex)) {
            log "Skipping invalid word '$word' (level $level)..."
            return
        }

        log "Adding insert for '$word' (level $level)..."
        # Get hyphenation
        cd ..\words-finder\WordHyphenationFinder
        $hyphenatedWord = (dotnet run -- $word)

        if ($hyphenatedWord.StartsWith("ERROR ")) {
            $hyphenatedWord = $word
        }

        if ($hyphenatedWord.StartsWith("OK ")) {
            $hyphenatedWord = $hyphenatedWord.Substring(3)
            $hyphenatedWord = $hyphenatedWord -replace 'ΓùÅ', '|'
        }

        # Get audio link
        cd ..\WordAudioLinkFinder
        $audioLink = (dotnet run -- $word)

        if ($audioLink.StartsWith("ERROR ")) {
            $audioLink = $word
        }

        if ($audioLink.StartsWith("OK ")) {
            $audioLink = $audioLink.Substring(3)
        }

        cd ..\..\words

        log "INSERT INTO neondb.public.`"ya-pronunciation_words`"(word, level, hyphenation, `"audioLink`", `"createdAt`", `"updatedAt`") VALUES ('$word', '$level', '$hyphenatedWord', '$audioLink', now(), now());${[Environment]::NewLine}" >> "inserts\inserts_$level.sql"
    }
    log "Finished file $_"
}

log "Done!"