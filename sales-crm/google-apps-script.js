/**
 * Google Apps Script - Auto-push new leads to Sales CRM
 * 
 * SETUP:
 * 1. Open your Google Sheet → Extensions → Apps Script
 * 2. Paste this entire code
 * 3. Replace WEBHOOK_URL with your deployed CRM URL
 * 4. Run createTrigger() once from the editor (Run menu)
 * 5. Authorize when prompted
 *
 * HOW IT WORKS:
 * - An onEdit trigger watches for changes in the sheet
 * - When a new row is added, it sends the data to your CRM webhook
 * - The CRM auto-assigns the lead to a sales caller
 */

// ⚠️ Replace this with your actual deployed URL
const WEBHOOK_URL = 'https://beige-dingos-bet.loca.lt/api/webhook/new-lead';
// For local testing, use: 'http://localhost:3000/api/webhook/new-lead'

/**
 * Run this function ONCE to create the trigger.
 * Go to Run → createTrigger in the Apps Script editor.
 */
function createTrigger() {
    // Remove existing triggers to avoid duplicates
    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));

    // Create onChange trigger
    ScriptApp.newTrigger('onSheetChange')
        .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
        .onChange()
        .create();

    Logger.log('Trigger created successfully!');
}

/**
 * Triggered when the sheet changes (new row, edit, etc.)
 */
function onSheetChange(e) {
    if (e.changeType !== 'INSERT_ROW' && e.changeType !== 'EDIT') return;

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const lastRow = sheet.getLastRow();

    if (lastRow < 2) return; // No data rows

    // Get the last row data
    const row = sheet.getRange(lastRow, 1, 1, 7).getValues()[0];

    const payload = {
        name: row[0] || '',
        phone: String(row[1] || ''),
        timestamp: row[2] ? new Date(row[2]).toISOString() : new Date().toISOString(),
        lead_source: row[3] || '',
        city: row[4] || '',
        state: row[5] || '',
        metadata: row[6] || '',
        sheet_row_number: lastRow,
    };

    // Skip if name is empty
    if (!payload.name) return;

    try {
        const response = UrlFetchApp.fetch(WEBHOOK_URL, {
            method: 'post',
            contentType: 'application/json',
            headers: {
                "bypass-tunnel-reminder": "true"
            },
            payload: JSON.stringify(payload),
            muteHttpExceptions: true,
        });

        Logger.log('Response: ' + response.getContentText());
    } catch (error) {
        Logger.log('Error sending webhook: ' + error.message);
    }
}

/**
 * Manual function to sync ALL rows (useful for initial sync)
 * Run this from the Apps Script editor to push all existing data.
 */
function syncAllRows() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const lastRow = sheet.getLastRow();

    if (lastRow < 2) {
        Logger.log('No data to sync');
        return;
    }

    const data = sheet.getRange(2, 1, lastRow - 1, 7).getValues();

    data.forEach((row, index) => {
        const payload = {
            name: row[0] || '',
            phone: String(row[1] || ''),
            timestamp: row[2] ? new Date(row[2]).toISOString() : new Date().toISOString(),
            lead_source: row[3] || '',
            city: row[4] || '',
            state: row[5] || '',
            metadata: row[6] || '',
            sheet_row_number: index + 2,
        };

        if (!payload.name) return;

        try {
            UrlFetchApp.fetch(WEBHOOK_URL, {
                method: 'post',
                contentType: 'application/json',
                payload: JSON.stringify(payload),
                muteHttpExceptions: true,
            });
            Logger.log('Synced row ' + (index + 2));
        } catch (error) {
            Logger.log('Error on row ' + (index + 2) + ': ' + error.message);
        }

        // Small delay to avoid rate limiting
        Utilities.sleep(200);
    });

    Logger.log('Sync complete!');
}
